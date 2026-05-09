import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { checkUser } from '@/lib/checkUser';

export async function GET(req, { params }) {
  try {
    const user = await checkUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const goal = await db.careerGoal.findUnique({ where: { id }, include: { milestones: true } });
    if (!goal || goal.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ goal });
  } catch (err) {
    console.error('GET /api/career-goals/[id]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await checkUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const goal = await db.careerGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { title, description, dueDate, status, milestones } = body;

    const updated = await db.careerGoal.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
      },
    });

    // handle milestones: support deletion flag, skip empty titles, upsert/create
    if (Array.isArray(milestones)) {
      for (const m of milestones) {
        const title = (m.title || '').toString().trim();
        if (m._delete && m.id) {
          // delete milestone
          try { await db.careerMilestone.delete({ where: { id: m.id } }); } catch (e) { console.warn('Failed to delete milestone', m.id, e); }
          continue;
        }
        if (!title && !m.id) {
          // nothing to create
          continue;
        }
        // update existing
        if (m.id) {
          await db.careerMilestone.update({
            where: { id: m.id },
            data: { title: title || undefined, notes: m.notes || '', dueDate: m.dueDate ? new Date(m.dueDate) : null, done: !!m.done },
          });
        } else {
          // create new milestone
          await db.careerMilestone.create({ data: { goalId: id, title: title, notes: m.notes || '', dueDate: m.dueDate ? new Date(m.dueDate) : null, done: !!m.done } });
        }
      }
    }

    const resGoal = await db.careerGoal.findUnique({ where: { id }, include: { milestones: true } });
    return NextResponse.json({ goal: resGoal });
  } catch (err) {
    console.error('PUT /api/career-goals/[id]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await checkUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const goal = await db.careerGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // cascade delete milestones first
    await db.careerMilestone.deleteMany({ where: { goalId: id } });
    await db.careerGoal.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/career-goals/[id]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

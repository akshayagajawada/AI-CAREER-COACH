import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { checkUser } from '@/lib/checkUser';

export async function GET() {
  try {
    const user = await checkUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const goals = await db.careerGoal.findMany({
      where: { userId: user.id },
      include: { milestones: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (err) {
    console.error('GET /api/career-goals', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await checkUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    console.log('POST /api/career-goals body:', body);
    const { title, description, dueDate, milestones } = body;

    // Prepare milestone nested create only if provided and non-empty (trim titles)
    const milestoneCreates = Array.isArray(milestones) && milestones.length > 0
      ? milestones
          .map(m => ({ ...m, title: (m.title || '').toString().trim() }))
          .filter(m => m.title && m.title.length > 0)
          .map((m) => ({ title: m.title, notes: m.notes || '', dueDate: m.dueDate ? new Date(m.dueDate) : null }))
      : undefined;

    const dataPayload = {
      userId: user.id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (milestoneCreates) {
      dataPayload.milestones = { create: milestoneCreates };
    }

    const created = await db.careerGoal.create({
      data: dataPayload,
      include: { milestones: true },
    });

    return NextResponse.json({ goal: created }, { status: 201 });
  } catch (err) {
    console.error('POST /api/career-goals', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

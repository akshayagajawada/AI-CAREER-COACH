import CareerRoadmap from '../../components/career-roadmap';

export const metadata = {
  title: 'Career Roadmap',
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Career Roadmap</h1>
      <CareerRoadmap />
    </main>
  );
}

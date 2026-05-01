'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { UserPlus, UserMinus, GraduationCap } from 'lucide-react';

export default function CoachStudentsPage() {
  const [myStudents, setMyStudents] = useState([]);
  const [available, setAvailable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [myStudentsData, unassignedData] = await Promise.all([
        UserService.getMyStudents(),
        UserService.getUnassignedStudents(),
      ]);

      setMyStudents(myStudentsData);
      setAvailable(unassignedData);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (id: number) => {
    try {
      await UserService.assignStudent(id);
      fetchData();
    } catch (err) {
      alert('Cannot add student');
    }
  };

  const handleUnassign = async (id: number) => {
    if (confirm('You sure you want to unassign the student?')) {
      try {
        await UserService.unassignStudent(id);
        fetchData();
      } catch (err) {
        alert('Cannot unassign student');
      }
    }
  };

  if (isLoading && myStudents.length === 0) {
    return <div className="text-center py-10">Loading student list...</div>;
  }

  return (
    <div className="space-y-8 px-4 py-6">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <GraduationCap className="text-indigo-600" />
          Мої учні ({myStudents.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myStudents.map((student: any) => (
            <div
              key={student.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-200 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {student.fullName}
                </p>
                <p className="text-sm text-slate-500">{student.email}</p>
              </div>
              <button
                onClick={() => handleUnassign(student.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Відкріпити учня"
              >
                <UserMinus size={20} />
              </button>
            </div>
          ))}
          {myStudents.length === 0 && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              У вас ще немає закріплених учнів
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 text-slate-800">
          Вільні учні (без тренера)
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ім'я
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Дія
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {available.map((student: any) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {student.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleAssign(student.id)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <UserPlus size={16} /> Додати до групи
                      </button>
                    </td>
                  </tr>
                ))}
                {available.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-slate-400 italic"
                    >
                      Наразі немає вільних учнів у системі
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

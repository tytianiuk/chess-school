'use client';

import { useEffect, useState } from 'react';
import { AssignmentService } from '@/services/assignment.service';
import { UserService } from '@/services/user.service';
import { BookOpen, Send, Trash2, Plus, ClipboardList } from 'lucide-react';

export default function CoachAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [myStudents, setMyStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стан для модалки призначення
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, studentsData] = await Promise.all([
        AssignmentService.getAll(),
        UserService.getMyStudents(),
      ]);
      setAssignments(assignmentsData);
      setMyStudents(studentsData);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей набір завдань?')) {
      try {
        await AssignmentService.remove(id);
        fetchData();
      } catch (err) {
        alert('Error deleting assignment');
      }
    }
  };

  const handleOpenAssignModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedStudentId || !selectedAssignment) return;
    try {
      await AssignmentService.assignToStudent({
        studentId: Number(selectedStudentId),
        assignmentId: selectedAssignment.id,
      });
      setIsModalOpen(false);
      setSelectedStudentId('');
    } catch (err) {
      alert('Error assigning assignment');
    }
  };

  if (isLoading && assignments.length === 0) {
    return <div className="text-center py-10">Завантаження завдань...</div>;
  }

  return (
    <div className="space-y-8 px-4 py-6">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <BookOpen className="text-indigo-600" />
            Набори завдань ({assignments.length})
          </h3>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-semibold">
            <Plus size={18} /> Створити набір
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((asg: any) => (
            <div
              key={asg.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded">
                    {asg.puzzles?.length || 0} пазлів
                  </span>
                  <button
                    onClick={() => handleDelete(asg.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  {asg.title}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {asg.description}
                </p>
              </div>

              <button
                onClick={() => handleOpenAssignModal(asg)}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-semibold text-sm"
              >
                <Send size={16} /> Призначити учню
              </button>
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              Ви ще не створили жодного набору завдань
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <ClipboardList className="text-indigo-600" />
          Швидкий огляд
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Назва
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Опис
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    К-сть задач
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asg: any) => (
                  <tr
                    key={asg.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {asg.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[200px]">
                      {asg.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-semibold">
                      {asg.puzzles?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Призначити завдання
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Оберіть учня для набору{' '}
              <span className="font-bold text-slate-800">
                "{selectedAssignment?.title}"
              </span>
            </p>

            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Оберіть вашого учня...</option>
              {myStudents.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedStudentId}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

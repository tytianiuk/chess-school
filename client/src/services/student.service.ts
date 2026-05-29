import api from '@/lib/api';

export const StudentService = {
  async getMyStudents(search?: string) {
    const { data } = await api.get(
      `/students/my-students?search=${search || ''}`,
    );
    return data;
  },

  async getUnassignedStudents(search: string) {
    const { data } = await api.get(`/students/unassigned?search=${search}`);
    return data;
  },

  async assignStudent(studentId: number) {
    const { data } = await api.patch(`/students/assign/${studentId}`);
    return data;
  },

  async unassignStudent(studentId: number) {
    const { data } = await api.patch(`/students/unassign/${studentId}`);
    return data;
  },
};

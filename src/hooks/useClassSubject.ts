import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Classes from "../services/classes";
import * as Subjects from "../services/subjects";

export function useAllClasses() {
  return useQuery({
    queryKey: ["classesAll"],
    queryFn: async () => {
      const { data } = await Classes.fetchClasses();
      return data ?? [];
    },
  });
}

export function useClass(id?: string) {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await Classes.fetchClassById(id);
      return data ?? null;
    },
    enabled: !!id,
  });
}

export function useSubject(id?: string) {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await Subjects.fetchSubjectById(id);
      return data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const r = await Classes.createClass(payload);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classesAll"] }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const r = await Classes.updateClass(id, patch);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classesAll"] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await Classes.deleteClass(id);
      if (r.error) throw r.error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classesAll"] }),
  });
}

export function useAllSubjects() {
  return useQuery({
    queryKey: ["subjectsAll"],
    queryFn: async () => {
      const { data } = await Subjects.fetchSubjects();
      return data ?? [];
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const r = await Subjects.createSubject(payload);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjectsAll"] }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const r = await Subjects.updateSubject(id, patch);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjectsAll"] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await Subjects.deleteSubject(id);
      if (r.error) throw r.error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjectsAll"] }),
  });
}

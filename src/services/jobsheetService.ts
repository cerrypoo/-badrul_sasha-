import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { JobsheetItem, JobsheetStatus, Student } from '../types';

const TOTAL_JOBSHEETS = 24;
const COLLECTION = 'jobsheets';

const emptyItem = (id: number): JobsheetItem => ({
  id,
  status: 'not-started',
  pdfName: null,
  pdfUrl: null,
  uploadedAt: null,
  liveName: null,
  liveUrl: null,
});

const docId = (student: Student, id: number) => `${student}-${id}`;

export const subscribeAllJobsheets = (
  onChange: (data: Record<Student, JobsheetItem[]>) => void
) => {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const result: Record<Student, JobsheetItem[]> = {
      sasha: Array.from({ length: TOTAL_JOBSHEETS }, (_, i) => emptyItem(i + 1)),
      badrul: Array.from({ length: TOTAL_JOBSHEETS }, (_, i) => emptyItem(i + 1)),
    };

    snapshot.forEach((d) => {
      const data = d.data() as JobsheetItem & { student: Student };
      const student = data.student;
      const idx = data.id - 1;
      if (result[student] && idx >= 0 && idx < TOTAL_JOBSHEETS) {
        result[student][idx] = {
          id: data.id,
          status: data.status ?? 'not-started',
          pdfName: data.pdfName ?? null,
          pdfUrl: data.pdfUrl ?? null,
          uploadedAt: data.uploadedAt ?? null,
          liveName: data.liveName ?? null,
          liveUrl: data.liveUrl ?? null,
        };
      }
    });

    onChange(result);
  });
};

export const uploadPdf = async (student: Student, id: number, file: File) => {
  const path = `jobsheets/${student}/${id}/pdf-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await setDoc(
    doc(db, COLLECTION, docId(student, id)),
    {
      student,
      id,
      pdfName: file.name,
      pdfUrl: url,
      uploadedAt: new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    },
    { merge: true }
  );

  await ensureStatusAtLeastInProgress(student, id);
};

export const uploadLive = async (student: Student, id: number, file: File) => {
  const path = `jobsheets/${student}/${id}/live-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await setDoc(
    doc(db, COLLECTION, docId(student, id)),
    { student, id, liveName: file.name, liveUrl: url },
    { merge: true }
  );
};

const ensureStatusAtLeastInProgress = async (student: Student, id: number) => {
  await setDoc(
    doc(db, COLLECTION, docId(student, id)),
    { status: 'in-progress' as JobsheetStatus },
    { merge: true }
  );
};

export const deletePdf = async (student: Student, id: number) => {
  await updateDoc(doc(db, COLLECTION, docId(student, id)), {
    pdfName: null,
    pdfUrl: null,
    uploadedAt: null,
    status: 'not-started',
  });
};

export const deleteLive = async (student: Student, id: number) => {
  await updateDoc(doc(db, COLLECTION, docId(student, id)), {
    liveName: null,
    liveUrl: null,
  });
};

export const markChecked = async (student: Student, id: number) => {
  await setDoc(
    doc(db, COLLECTION, docId(student, id)),
    { student, id, status: 'checked' as JobsheetStatus },
    { merge: true }
  );
};

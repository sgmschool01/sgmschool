'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/app/utils/notify';

const API = process.env.NEXT_PUBLIC_API_URL || "https://sgmschool.onrender.com";

type Term = { id: number; term_name: string };
type ClassItem = { class_id: number; class_name: string };
type SectionItem = { section_id: number; section_name: string; class_id: number };
type SubjectCol = { subject_id: number; subject_name: string; subject_code?: string | null };

type StudentRow = {
    student_id: number;
    first_name: string;
    last_name: string;
    admission_no?: string | null;
    roll_no?: string | null;
    subject_marks: { subject_id: number; obtained_marks: number | null; total_marks: number | null }[];
    grand_obtained: number;
    grand_total: number;
    position: number | null;
    ordinal_position: string | null;
    percentage: number | null;
    grade: string | null;
};

type SheetMeta = {
    term_id: number;
    term_name: string;
    year_name: string;
    class_id: number;
    class_name: string;
    section_id: number;
    section_name: string;
};

type SchoolInfo = {
    school_name?: string;
    school_address?: string;
    phone_number?: string;
    school_phone2?: string;
    school_phone3?: string;
    school_logo_url?: string;
};

type SheetPayload = {
    meta: SheetMeta;
    school: SchoolInfo;
    subjects: SubjectCol[];
    students: StudentRow[];
};

function esc(text: unknown) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fmtN(v: number | null | undefined): string {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
}

function getLogoUrl(rawLogo?: string): string {
    if (!rawLogo || !rawLogo.trim()) return '';
    const logoStr = rawLogo.trim();
    if (logoStr.startsWith('http://') || logoStr.startsWith('https://') || logoStr.startsWith('data:')) {
        return logoStr;
    }
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://sgmschool.onrender.com").replace(/\/+$/, '');
    const cleanPath = logoStr.replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
}

function buildPrintHtml(payload: SheetPayload): string {
    const { meta, school, subjects, students } = payload;
    const schoolName = school.school_name || 'Smart School';
    const address = school.school_address || '';
    const phones = [school.phone_number, school.school_phone2, school.school_phone3].filter(Boolean).join(' | ');
    const logo = getLogoUrl(school.school_logo_url);

    const theadCols = subjects.map(s => `<th>${esc(s.subject_name)}</th>`).join('');
    const tbodyRows = students.map((student, idx) => {
        const markCols = subjects.map(s => {
            const sm = student.subject_marks.find(m => m.subject_id === s.subject_id);
            return `<td class="center">${sm && sm.obtained_marks !== null ? esc(fmtN(sm.obtained_marks)) : ''}</td>`;
        }).join('');
        return `
            <tr>
                <td class="center">${esc(student.roll_no || String(idx + 1))}</td>
                <td class="name-col">${esc(`${student.first_name} ${student.last_name}`)}</td>
                ${markCols}
                <td class="center bold">${student.grand_total > 0 ? esc(fmtN(student.grand_obtained)) : ''}</td>
                <td class="center bold">${esc(student.ordinal_position || '')}</td>
            </tr>
        `;
    }).join('');

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Marks Sheet – ${esc(meta.class_name)} ${esc(meta.section_name)}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 12px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 12px; }
  .school-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #1e293b; }
  .meta-bar { display: flex; justify-content: space-between; background: #f1f5f9; padding: 6px 10px; font-weight: bold; border-radius: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #94a3b8; padding: 6px; }
  th { background: #1e293b; color: #fff; text-align: center; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .name-col { text-align: left; font-weight: 600; }
</style>
</head>
<body onload="window.print()">
  <div class="header">
    <div>
      <div class="school-title">${esc(schoolName)}</div>
      <div>${esc(address)} ${phones ? ' | Tel: ' + esc(phones) : ''}</div>
    </div>
    ${logo ? `<img src="${esc(logo)}" style="max-height: 50px;"/>` : ''}
  </div>
  <div class="meta-bar">
    <span>CLASS: ${esc(meta.class_name)} (${esc(meta.section_name)})</span>
    <span>TERM: ${esc(meta.term_name)}</span>
    <span>YEAR: ${esc(meta.year_name)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">Roll No</th>
        <th>Student Name</th>
        ${theadCols}
        <th style="width: 80px;">Total</th>
        <th style="width: 70px;">Rank</th>
      </tr>
    </thead>
    <tbody>
      ${tbodyRows}
    </tbody>
  </table>
</body>
</html>`;
}

export default function ClassMarksSheetPage() {
    const { user } = useAuth();

    const [loadingCtx, setLoadingCtx] = useState(true);
    const [loading, setLoading] = useState(false);
    const [printing, setPrinting] = useState(false);

    const [activeYearName, setActiveYearName] = useState('');
    const [terms, setTerms] = useState<Term[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);

    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [sheet, setSheet] = useState<SheetPayload | null>(null);

    const canUsePage = !!user;

    const filteredSections = useMemo(() => {
        if (!selectedClass) return [];
        return sections.filter(s => s.class_id === Number(selectedClass));
    }, [sections, selectedClass]);

    const ready = !!(selectedTerm && selectedClass && selectedSection && user?.id);

    const loadContext = async () => {
        if (!user?.id) { setLoadingCtx(false); return; }
        setLoadingCtx(true);
        try {
            const r = await fetch(`${API}/exams/context/class-teacher?user_id=${user.id}`);
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to load context');

            const nextTerms = Array.isArray(d.terms) ? d.terms : [];
            const nextClasses = Array.isArray(d.classes) ? d.classes : [];
            const nextSections = Array.isArray(d.sections) ? d.sections : [];

            setTerms(nextTerms);
            setClasses(nextClasses);
            setSections(nextSections);
            setActiveYearName(d.active_year?.year_name || '');

            setSelectedTerm((prev) => {
                if (prev && nextTerms.some((t: Term) => String(t.id) === prev)) return prev;
                return nextTerms.length > 0 ? String(nextTerms[0].id) : '';
            });

            setSelectedClass((prev) => {
                if (prev && nextClasses.some((c: ClassItem) => String(c.class_id) === prev)) return prev;
                return nextClasses.length > 0 ? String(nextClasses[0].class_id) : '';
            });
        } catch (e: any) {
            notify.error(e.message || 'Failed to load context');
        } finally {
            setLoadingCtx(false);
        }
    };

    const loadSheet = async () => {
        if (!ready || !user?.id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: String(user.id),
                term_id: selectedTerm,
                class_id: selectedClass,
                section_id: selectedSection
            });
            const r = await fetch(`${API}/exams/class-marks-sheet?${params.toString()}`);
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to load marks sheet');

            setSheet(d as SheetPayload);
        } catch (e: any) {
            setSheet(null);
            notify.error(e.message || 'Failed to load marks sheet');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        if (!sheet) return;
        setPrinting(true);
        try {
            const html = buildPrintHtml(sheet);
            const win = window.open('', '_blank', 'width=1200,height=850');
            if (!win) {
                notify.warning('Popup blocked. Please allow popups and try again.');
                return;
            }
            win.document.open();
            win.document.write(html);
            win.document.close();
            win.focus();
            notify.success('Opening print document.');
        } catch (e: any) {
            notify.error(e.message || 'Print failed');
        } finally {
            setPrinting(false);
        }
    };

    useEffect(() => { loadContext(); }, [user?.id]);

    useEffect(() => {
        setSelectedSection('');
        setSheet(null);
    }, [selectedClass]);

    useEffect(() => {
        setSheet(null);
    }, [selectedTerm, selectedSection]);

    useEffect(() => {
        if (filteredSections.length === 1 && !selectedSection) {
            setSelectedSection(String(filteredSections[0].section_id));
        }
    }, [filteredSections, selectedSection]);

    useEffect(() => {
        if (ready) loadSheet();
    }, [ready, selectedTerm, selectedClass, selectedSection]);

    if (!canUsePage) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">You do not have permission to access Class Marks Sheet.</div>
            </div>
        );
    }

    return (
        <div className="page-wrap" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '3rem' }}>

            {/* Page Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="mb-1 fw-bold" style={{ color: 'var(--primary-dark)' }}>
                        <i className="bi bi-table me-2" style={{ color: 'var(--accent-orange)' }} />
                        Class Marks Sheet
                    </h4>
                    <div className="text-muted small">Comprehensive class-wide subject marks sheet & ranking</div>
                </div>
                <span className="badge rounded-pill bg-dark text-white px-3 py-2 border shadow-xs">
                    <i className="bi bi-calendar3 me-1" /> Session: {activeYearName || 'Active Year'}
                </span>
            </div>

            {/* Seamless Selection Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3" style={{ borderLeft: '4px solid var(--primary-teal)' }}>
                    <h6 className="mb-0 fw-bold" style={{ color: 'var(--primary-dark)' }}>
                        <i className="bi bi-sliders me-2" style={{ color: 'var(--primary-teal)' }} />
                        Select Class Target (Auto-loads Sheet)
                    </h6>
                </div>
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-dark small mb-1">
                                <span className="badge bg-dark text-white me-1">1</span> Select Term
                            </label>
                            <select className="form-select form-select-md border-2" value={selectedTerm}
                                onChange={e => setSelectedTerm(e.target.value)} disabled={loadingCtx}>
                                <option value="">-- Choose Term --</option>
                                {terms.map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-dark small mb-1">
                                <span className="badge bg-dark text-white me-1">2</span> Select Class
                            </label>
                            <select className="form-select form-select-md border-2" value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)} disabled={loadingCtx}>
                                <option value="">-- Choose Class --</option>
                                {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-semibold text-dark small mb-1">
                                <span className="badge bg-dark text-white me-1">3</span> Select Section
                            </label>
                            <select className="form-select form-select-md border-2" value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                                disabled={!selectedClass || loadingCtx}>
                                <option value="">-- Choose Section --</option>
                                {filteredSections.map(s => (
                                    <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sheet Preview Card */}
            {ready && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center"
                        style={{ borderLeft: '4px solid #10b981' }}>
                        <div>
                            <h5 className="mb-0 fw-bold text-dark">
                                <i className="bi bi-journal-text me-2 text-success" />
                                {loading ? 'Loading Sheet...' : sheet
                                    ? `${sheet.meta.class_name} (${sheet.meta.section_name}) ${sheet.meta.term_name}`
                                    : 'Class Marks Sheet'}
                            </h5>
                            {sheet && (
                                <div className="text-muted extra-small mt-1">
                                    {sheet.students.length} Active Students · {sheet.subjects.length} Subjects Evaluated
                                </div>
                            )}
                        </div>

                        {sheet && !loading && (
                            <button className="btn btn-success fw-bold px-4 rounded-pill shadow-xs" onClick={handlePrint} disabled={printing}>
                                {printing ? <><span className="spinner-border spinner-border-sm me-1" />Opening...</> : <><i className="bi bi-printer-fill me-1" />Print Landscape Sheet</>}
                            </button>
                        )}
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="py-5 text-center text-muted">
                                <span className="spinner-border text-primary me-2" />Loading class marks sheet...
                            </div>
                        ) : !sheet ? (
                            <div className="py-5 text-center text-muted">Select term, class and section to view the marks sheet.</div>
                        ) : sheet.students.length === 0 ? (
                            <div className="py-5 text-center text-muted">No active students found for selected class & section.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: 80 }} className="ps-4">Roll No</th>
                                            <th style={{ minWidth: 180 }}>Student Name</th>
                                            {sheet.subjects.map(s => (
                                                <th key={s.subject_id} className="text-center" style={{ minWidth: 90 }}>
                                                    {s.subject_name}
                                                </th>
                                            ))}
                                            <th className="text-center" style={{ minWidth: 110 }}>Grand Total</th>
                                            <th className="text-center pe-4" style={{ minWidth: 90 }}>Position</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sheet.students.map((student, idx) => (
                                            <tr key={student.student_id}>
                                                <td className="ps-4 fw-bold text-dark">{student.roll_no || idx + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                                            style={{ width: 30, height: 30, fontSize: '0.8rem' }}
                                                        >
                                                            {student.first_name[0]}{student.last_name[0] || ''}
                                                        </div>
                                                        <div className="fw-semibold text-dark">
                                                            {student.first_name} {student.last_name}
                                                        </div>
                                                    </div>
                                                </td>
                                                {sheet.subjects.map(s => {
                                                    const sm = student.subject_marks.find(m => m.subject_id === s.subject_id);
                                                    return (
                                                        <td key={s.subject_id} className="text-center fw-semibold">
                                                            {sm && sm.obtained_marks !== null ? fmtN(sm.obtained_marks) : <span className="text-muted extra-small">—</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td className="text-center fw-bold text-primary">
                                                    {student.grand_total > 0 ? fmtN(student.grand_obtained) : <span className="text-muted">—</span>}
                                                </td>
                                                <td className="text-center pe-4">
                                                    {student.ordinal_position ? (
                                                        <span className="badge bg-indigo text-white px-3 py-1 rounded-pill fw-bold">
                                                            {student.ordinal_position}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted extra-small">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

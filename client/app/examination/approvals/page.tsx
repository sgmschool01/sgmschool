'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/app/utils/notify';

type ApprovalSheet = {
    sheet_type: 'term_exam' | 'test_paper';
    id: string;
    term_id?: number;
    term_name?: string;
    test_id?: number;
    test_name?: string;
    description?: string;
    total_marks?: number;
    class_id: number;
    class_name: string;
    section_id: number;
    section_name: string;
    subject_id: number;
    subject_name: string;
    status: 'pending' | 'approved' | 'published';
    student_count: number;
    submitted_by_name: string;
    approved_by_name: string;
    published_by_name: string;
    last_updated?: string;
};

type SummaryStats = {
    total_sheets: number;
    pending_count: number;
    approved_count: number;
    published_count: number;
};

type StudentDetailRow = {
    student_id: number;
    first_name: string;
    last_name: string;
    admission_no?: string | null;
    roll_no?: string | null;
    obtained_marks?: number | null;
    total_marks?: number | null;
    remarks?: string | null;
    status?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "https://sgmschool.onrender.com";

export default function MarksApprovalPage() {
    const { user } = useAuth();

    // ── state ─────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [canApprove, setCanApprove] = useState(false);
    const [canPublish, setCanPublish] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [summary, setSummary] = useState<SummaryStats>({ total_sheets: 0, pending_count: 0, approved_count: 0, published_count: 0 });
    const [sheets, setSheets] = useState<ApprovalSheet[]>([]);

    // ── filters ───────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'all' | 'term_exam' | 'test_paper'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'published'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // ── detail modal ──────────────────────────────────────────────────────────
    const [selectedSheet, setSelectedSheet] = useState<ApprovalSheet | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailStudents, setDetailStudents] = useState<StudentDetailRow[]>([]);
    const [obtainedMap, setObtainedMap] = useState<Record<number, string>>({});
    const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
    const [savingMarks, setSavingMarks] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // ── fetch approvals list ──────────────────────────────────────────────────
    const loadApprovals = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: String(user.id),
                sheet_type: activeTab,
                status: statusFilter
            });
            const r = await fetch(`${API}/exams/approvals/list?${params.toString()}`);
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to load approvals');

            setCanApprove(!!d.can_approve);
            setCanPublish(!!d.can_publish);
            setUserRole(d.user_role || 'Staff');
            setSummary(d.summary || { total_sheets: 0, pending_count: 0, approved_count: 0, published_count: 0 });
            setSheets(d.sheets || []);
        } catch (e: any) {
            notify.error(e.message || 'Failed to load approvals list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, [user?.id, activeTab, statusFilter]);

    // ── filtered sheets search ────────────────────────────────────────────────
    const filteredSheets = useMemo(() => {
        if (!searchQuery.trim()) return sheets;
        const q = searchQuery.toLowerCase();
        return sheets.filter(s =>
            s.class_name.toLowerCase().includes(q) ||
            s.section_name.toLowerCase().includes(q) ||
            s.subject_name.toLowerCase().includes(q) ||
            (s.term_name && s.term_name.toLowerCase().includes(q)) ||
            (s.test_name && s.test_name.toLowerCase().includes(q)) ||
            s.submitted_by_name.toLowerCase().includes(q)
        );
    }, [sheets, searchQuery]);

    // ── open sheet detail modal ───────────────────────────────────────────────
    const openSheetDetail = async (sheet: ApprovalSheet) => {
        if (!user?.id) return;
        setSelectedSheet(sheet);
        setLoadingDetail(true);
        try {
            const params = new URLSearchParams({
                user_id: String(user.id),
                sheet_type: sheet.sheet_type
            });
            if (sheet.sheet_type === 'term_exam') {
                params.set('term_id', String(sheet.term_id));
                params.set('class_id', String(sheet.class_id));
                params.set('section_id', String(sheet.section_id));
                params.set('subject_id', String(sheet.subject_id));
            } else {
                params.set('test_id', String(sheet.test_id));
            }

            const r = await fetch(`${API}/exams/approvals/sheet-detail?${params.toString()}`);
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to load sheet detail');

            const stList: StudentDetailRow[] = d.students || [];
            setDetailStudents(stList);

            const om: Record<number, string> = {};
            const rm: Record<number, string> = {};
            for (const st of stList) {
                om[st.student_id] = st.obtained_marks !== null && st.obtained_marks !== undefined ? String(st.obtained_marks) : '';
                rm[st.student_id] = st.remarks || '';
            }
            setObtainedMap(om);
            setRemarksMap(rm);
        } catch (e: any) {
            notify.error(e.message || 'Failed to open sheet detail');
            setSelectedSheet(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    // ── save updated student marks ────────────────────────────────────────────
    const handleSaveAdjustedMarks = async () => {
        if (!user?.id || !selectedSheet) return;

        setSavingMarks(true);
        try {
            const marksPayload = detailStudents.map(st => ({
                student_id: st.student_id,
                obtained_marks: obtainedMap[st.student_id] !== '' ? Number(obtainedMap[st.student_id]) : null,
                remarks: remarksMap[st.student_id] || null
            }));

            const payload: any = {
                user_id: user.id,
                sheet_type: selectedSheet.sheet_type,
                marks: marksPayload
            };

            if (selectedSheet.sheet_type === 'term_exam') {
                payload.term_id = selectedSheet.term_id;
                payload.class_id = selectedSheet.class_id;
                payload.section_id = selectedSheet.section_id;
                payload.subject_id = selectedSheet.subject_id;
                payload.total_marks = detailStudents[0]?.total_marks || 100;
            } else {
                payload.test_id = selectedSheet.test_id;
            }

            const r = await fetch(`${API}/exams/approvals/update-marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to update marks');

            notify.success(d.message || 'Student marks adjusted & saved.');
            await loadApprovals();
        } catch (e: any) {
            notify.error(e.message || 'Save failed');
        } finally {
            setSavingMarks(false);
        }
    };

    // ── change approval / publication status ─────────────────────────────────
    const handleChangeStatus = async (targetStatus: 'pending' | 'approved' | 'published') => {
        if (!user?.id || !selectedSheet) return;

        setUpdatingStatus(true);
        try {
            const payload: any = {
                user_id: user.id,
                sheet_type: selectedSheet.sheet_type,
                target_status: targetStatus
            };

            if (selectedSheet.sheet_type === 'term_exam') {
                payload.term_id = selectedSheet.term_id;
                payload.class_id = selectedSheet.class_id;
                payload.section_id = selectedSheet.section_id;
                payload.subject_id = selectedSheet.subject_id;
            } else {
                payload.test_id = selectedSheet.test_id;
            }

            const r = await fetch(`${API}/exams/approvals/change-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Status update failed');

            notify.success(d.message || 'Status updated successfully.');
            setSelectedSheet(prev => prev ? { ...prev, status: targetStatus } : null);
            await loadApprovals();
        } catch (e: any) {
            notify.error(e.message || 'Status update failed');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const fmtDate = (iso?: string) => {
        if (!iso) return '-';
        try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return iso; }
    };

    return (
        <div className="page-wrap" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '3rem' }}>

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="mb-1 fw-bold" style={{ color: 'var(--primary-dark)' }}>
                        <i className="bi bi-patch-check-fill me-2" style={{ color: 'var(--accent-orange)' }} />
                        Marks Approval & Publishing
                    </h4>
                    <div className="text-muted small">
                        Review, edit student marks, approve, and publish term & test marks to Student Portal
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                    <span className="badge rounded-pill bg-dark text-white px-3 py-2 border shadow-xs">
                        <i className="bi bi-person-badge me-1" />
                        Role: {userRole}
                    </span>
                    {canPublish ? (
                        <span className="badge rounded-pill bg-success text-white px-3 py-2 shadow-xs">
                            <i className="bi bi-rocket-takeoff-fill me-1" />
                            Principal / Admin Mode (Approve & Publish)
                        </span>
                    ) : canApprove ? (
                        <span className="badge rounded-pill bg-info text-dark px-3 py-2 shadow-xs">
                            <i className="bi bi-check-circle-fill me-1" />
                            Coordinator / Head Mode (Approve Only)
                        </span>
                    ) : (
                        <span className="badge rounded-pill bg-secondary text-white px-3 py-2 shadow-xs">
                            <i className="bi bi-eye-fill me-1" />
                            Teacher Mode (Submission Tracker)
                        </span>
                    )}
                </div>
            </div>

            {/* ── Summary Stats Cards ─────────────────────────────────────── */}
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '4px solid var(--primary-dark)' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted extra-small fw-semibold text-uppercase">Total Sheets</div>
                                <h3 className="mb-0 fw-bold mt-1" style={{ color: 'var(--primary-dark)' }}>{summary.total_sheets}</h3>
                            </div>
                            <div className="rounded-circle p-3 bg-light text-dark fs-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                <i className="bi bi-collection-fill" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted extra-small fw-semibold text-uppercase">Pending Approval</div>
                                <h3 className="mb-0 fw-bold text-warning mt-1">{summary.pending_count}</h3>
                            </div>
                            <div className="rounded-circle p-3 bg-warning-subtle text-warning-emphasis fs-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                <i className="bi bi-hourglass-split" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '4px solid var(--primary-teal)' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted extra-small fw-semibold text-uppercase">Approved (Unpublished)</div>
                                <h3 className="mb-0 fw-bold text-info mt-1">{summary.approved_count}</h3>
                            </div>
                            <div className="rounded-circle p-3 bg-info-subtle text-info-emphasis fs-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                <i className="bi bi-shield-check" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '4px solid #10b981' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted extra-small fw-semibold text-uppercase">Published to Portal</div>
                                <h3 className="mb-0 fw-bold text-success mt-1">{summary.published_count}</h3>
                            </div>
                            <div className="rounded-circle p-3 bg-success-subtle text-success-emphasis fs-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                <i className="bi bi-globe2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Filter & Search Control Bar ────────────────────────── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <div className="btn-group w-100" role="group">
                                <button
                                    className={`btn btn-sm ${activeTab === 'all' ? 'btn-dark fw-bold' : 'btn-outline-secondary'}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    All Sheets
                                </button>
                                <button
                                    className={`btn btn-sm ${activeTab === 'term_exam' ? 'btn-dark fw-bold' : 'btn-outline-secondary'}`}
                                    onClick={() => setActiveTab('term_exam')}
                                >
                                    Term Exams
                                </button>
                                <button
                                    className={`btn btn-sm ${activeTab === 'test_paper' ? 'btn-dark fw-bold' : 'btn-outline-secondary'}`}
                                    onClick={() => setActiveTab('test_paper')}
                                >
                                    Class Tests
                                </button>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small fw-semibold text-nowrap">Status:</span>
                                <select
                                    className="form-select form-select-sm border-2"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="approved">Approved (Unpublished)</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white border-2 border-end-0"><i className="bi bi-search" /></span>
                                <input
                                    type="text"
                                    className="form-control border-2 border-start-0"
                                    placeholder="Search by class, subject, teacher..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table Card ──────────────────────────────────────────────── */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-muted small mt-2">Loading marks approval list...</div>
                        </div>
                    ) : filteredSheets.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary" />
                            No marks sheets found for selected filters.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: '110px' }} className="ps-4">Type</th>
                                        <th>Title / Term</th>
                                        <th>Class & Section</th>
                                        <th>Subject</th>
                                        <th className="text-center">Students</th>
                                        <th>Status</th>
                                        <th>Submitted By</th>
                                        <th>Last Updated</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSheets.map(s => {
                                        const isTerm = s.sheet_type === 'term_exam';
                                        return (
                                            <tr key={s.id}>
                                                <td className="ps-4">
                                                    <span className={`badge ${isTerm ? 'bg-indigo text-white' : 'bg-info text-dark'}`}>
                                                        <i className={`bi ${isTerm ? 'bi-journal-bookmark' : 'bi-file-earmark-text'} me-1`} />
                                                        {isTerm ? 'Term Exam' : 'Class Test'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-dark">
                                                        {isTerm ? s.term_name : s.test_name}
                                                    </div>
                                                    {s.description && <div className="text-muted extra-small">{s.description}</div>}
                                                </td>
                                                <td>
                                                    <span className="fw-semibold text-dark">{s.class_name}</span> - <span className="text-muted">{s.section_name}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border fw-semibold">{s.subject_name}</span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-secondary rounded-pill px-3">{s.student_count} Students</span>
                                                </td>
                                                <td>
                                                    {s.status === 'published' ? (
                                                        <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-2 rounded-pill">
                                                            <i className="bi bi-globe2 me-1" />Published
                                                        </span>
                                                    ) : s.status === 'approved' ? (
                                                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 rounded-pill">
                                                            <i className="bi bi-check-circle-fill me-1" />Approved
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">
                                                            <i className="bi bi-clock-fill me-1" />Pending Approval
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="small fw-semibold text-dark">{s.submitted_by_name}</div>
                                                </td>
                                                <td className="text-muted small">
                                                    {fmtDate(s.last_updated)}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <button
                                                        className="btn btn-sm btn-primary-custom rounded-pill px-3 fw-semibold shadow-xs"
                                                        onClick={() => openSheetDetail(s)}
                                                    >
                                                        <i className="bi bi-pencil-square me-1" />
                                                        Review & Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Review & Approval Modal ─────────────────────────────────── */}
            {selectedSheet && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex={-1}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-dark text-white">
                                <div>
                                    <h5 className="modal-title mb-0 fw-bold d-flex align-items-center">
                                        <i className="bi bi-journal-check me-2 text-warning" />
                                        Review Marks Sheet {selectedSheet.sheet_type === 'term_exam' ? selectedSheet.term_name : selectedSheet.test_name}
                                    </h5>
                                    <div className="small text-muted mt-1">
                                        {selectedSheet.class_name} ({selectedSheet.section_name}) | Subject: {selectedSheet.subject_name}
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedSheet(null)} />
                            </div>

                            <div className="modal-body p-4">
                                {loadingDetail ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status" />
                                        <div className="text-muted small mt-2">Fetching student marks sheet...</div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Status Header Banner */}
                                        <div className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-3 mb-4 bg-light border">
                                            <div>
                                                <span className="text-muted me-2 fw-semibold">Current Status:</span>
                                                {selectedSheet.status === 'published' ? (
                                                    <span className="badge bg-success fs-6"><i className="bi bi-globe2 me-1" />Published on Student Portal</span>
                                                ) : selectedSheet.status === 'approved' ? (
                                                    <span className="badge bg-info text-dark fs-6"><i className="bi bi-check-circle-fill me-1" />Approved (Awaiting Principal Publishing)</span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark fs-6"><i className="bi bi-clock-fill me-1" />Pending Approval</span>
                                                )}
                                            </div>

                                            <div className="text-muted small mt-2 mt-md-0">
                                                Submitted by: <b className="text-dark">{selectedSheet.submitted_by_name}</b>
                                            </div>
                                        </div>

                                        {/* Editable Students Marks Table */}
                                        <div className="table-responsive">
                                            <table className="table table-bordered align-middle mb-0">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th style={{ width: '80px' }} className="text-center">Roll No</th>
                                                        <th>Student Name</th>
                                                        <th style={{ width: '140px' }}>Admission No</th>
                                                        <th style={{ width: '160px' }}>Obtained Marks</th>
                                                        <th>Remarks / Comments</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detailStudents.map(st => (
                                                        <tr key={st.student_id}>
                                                            <td className="fw-bold text-center">{st.roll_no || '—'}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div
                                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                                                        style={{ width: 32, height: 32, fontSize: '0.85rem' }}
                                                                    >
                                                                        {st.first_name[0]}{st.last_name[0] || ''}
                                                                    </div>
                                                                    <div className="fw-semibold text-dark">
                                                                        {st.first_name} {st.last_name}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-muted small">{st.admission_no || '—'}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm text-center fw-bold border-2"
                                                                    value={obtainedMap[st.student_id] ?? ''}
                                                                    onChange={e => setObtainedMap(prev => ({ ...prev, [st.student_id]: e.target.value }))}
                                                                    placeholder="0.00"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={remarksMap[st.student_id] ?? ''}
                                                                    onChange={e => setRemarksMap(prev => ({ ...prev, [st.student_id]: e.target.value }))}
                                                                    placeholder="Add remarks..."
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer bg-light justify-content-between">
                                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedSheet(null)}>
                                    Close
                                </button>

                                <div className="d-flex flex-wrap align-items-center gap-2">
                                    {/* Save Marks Adjustment */}
                                    <button
                                        className="btn btn-secondary rounded-pill px-3"
                                        onClick={handleSaveAdjustedMarks}
                                        disabled={savingMarks || loadingDetail}
                                    >
                                        {savingMarks ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-save me-1" />}
                                        Save Marks Adjustment
                                    </button>

                                    {/* Approve Button (Role Level >= 65) */}
                                    {canApprove && selectedSheet.status !== 'approved' && (
                                        <button
                                            className="btn btn-info text-dark font-semibold rounded-pill px-4"
                                            onClick={() => handleChangeStatus('approved')}
                                            disabled={updatingStatus}
                                        >
                                            <i className="bi bi-check-circle-fill me-1" />
                                            Approve Sheet
                                        </button>
                                    )}

                                    {/* Publish Button (Role Level >= 90: Principal / VP / Admin) */}
                                    {canPublish ? (
                                        selectedSheet.status === 'published' ? (
                                            <button
                                                className="btn btn-outline-warning rounded-pill px-3"
                                                onClick={() => handleChangeStatus('pending')}
                                                disabled={updatingStatus}
                                            >
                                                <i className="bi bi-arrow-counterclockwise me-1" />
                                                Unpublish / Revert to Draft
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success fw-bold px-4 rounded-pill shadow-xs"
                                                onClick={() => handleChangeStatus('published')}
                                                disabled={updatingStatus}
                                            >
                                                <i className="bi bi-rocket-takeoff-fill me-1" />
                                                Publish to Student Portal
                                            </button>
                                        )
                                    ) : (
                                        <span className="badge bg-warning text-dark p-2 border rounded-pill">
                                            <i className="bi bi-lock-fill me-1" />
                                            Publishing Restricted (Requires Principal / VP / Admin)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Users, Plus, Copy, Trash2, X, Loader2, ChevronRight,
    UserCheck, Shield, TrendingUp
} from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { ExportButton, ExportColumn } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { ROLE_DEFINITIONS, PERMISSION_GROUPS, type Permission, type RoleType } from '@/constants/permissions';
import { useToast } from '@/context/ToastContext';

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    staffCode: string;
    roleType: string;
    customPermissions: Permission[];
    collaboratorCount: number;
    totalCommission: number;
    teamRevenue: number;
    teamOrders: number;
    createdAt: string;
}

interface Collaborator {
    id: string;
    name: string;
    email: string;
    phone: string;
    referralCode: string;
    parentStaffId: string;
    parentStaffName: string;
    parentStaffCode: string;
    walletBalance: number;
    totalCommission: number;
    createdAt: string;
}

type StaffView = 'staff' | 'collaborators' | 'revenue';

const ROLE_OPTIONS = Object.entries(ROLE_DEFINITIONS).map(([value, def]) => ({
    value: value as RoleType,
    label: def.name,
    description: def.description,
    color: def.color
}));

interface StaffCreateResponse {
    message?: string;
    emailSent?: boolean;
    emailMessage?: string;
    staff?: {
        staffCode?: string;
    };
}

async function readStaffResponse(res: Response): Promise<StaffCreateResponse> {
    const text = await res.text();
    if (!text) return {};

    try {
        return JSON.parse(text) as StaffCreateResponse;
    } catch {
        return { message: text };
    }
}

export default function AdminStaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [collaboratorList, setCollaboratorList] = useState<Collaborator[]>([]);
    const [activeView, setActiveView] = useState<StaffView>('staff');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [creating, setCreating] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; staffId: string | null; staffName: string }>({
        isOpen: false,
        staffId: null,
        staffName: ''
    });
    const [deleting, setDeleting] = useState<string | null>(null);
    const toast = useToast();
    const [expandedGroups, setExpandedGroups] = useState<string[]>(Object.keys(PERMISSION_GROUPS));
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleType: 'sales' as RoleType
    });

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            const [staffRes, collaboratorRes] = await Promise.all([
                fetch('/api/admin/staff'),
                fetch('/api/admin/staff?view=collaborators')
            ]);
            if (staffRes.ok) {
                setStaffList(await staffRes.json());
            }
            if (collaboratorRes.ok) {
                setCollaboratorList(await collaboratorRes.json());
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const createStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const payload = {
                name: newStaff.name.trim(),
                email: newStaff.email.trim().toLowerCase(),
                phone: newStaff.phone.trim(),
                password: newStaff.password,
                roleType: newStaff.roleType
            };

            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await readStaffResponse(res);
            if (res.ok) {
                toast.success(
                    'Tạo nhân viên thành công',
                    `Mã hệ thống: ${data.staff?.staffCode || 'Đã cấp'}${data.emailSent === false ? ' — Email chưa gửi được' : ' — Đã gửi thông tin đăng nhập qua email'}`
                );
                setShowModal(false);
                setNewStaff({ name: '', email: '', phone: '', password: '', roleType: 'sales' });
                fetchStaff();
            } else {
                toast.error('Lỗi tạo nhân viên', data.message || `Không tạo được nhân viên (HTTP ${res.status}).`);
            }
        } catch (error) {
            console.error('Error creating staff:', error);
            toast.error(
                'Lỗi khi tạo nhân viên',
                error instanceof Error ? error.message : 'Vui lòng thử lại.'
            );
        } finally {
            setCreating(false);
        }
    };

    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, staffId: id, staffName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.staffId) return;
        try {
            setDeleting(deleteModal.staffId);
            const res = await fetch('/api/admin/staff', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId: deleteModal.staffId })
            });

            if (res.ok) {
                setStaffList(prev => prev.filter(s => s.id !== deleteModal.staffId));
                setDeleteModal({ isOpen: false, staffId: null, staffName: '' });
            } else {
                const data = await res.json();
                toast.error('Lỗi xóa nhân viên', data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            toast.error('Lỗi xóa nhân viên', 'Vui lòng thử lại.');
        } finally {
            setDeleting(null);
        }
    };

    const openPermissionModal = (staff: Staff) => {
        setSelectedStaff(staff);
        setSelectedPermissions(staff.customPermissions || []);
        setShowPermissionModal(true);
    };

    const togglePermissionGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const togglePermission = (permission: Permission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const selectAllInGroup = (group: string) => {
        const groupPermissions = PERMISSION_GROUPS[group] || [];
        const missing = groupPermissions.filter(p => !selectedPermissions.includes(p));
        setSelectedPermissions(prev => [...prev, ...missing]);
    };

    const deselectAllInGroup = (group: string) => {
        const groupPermissions = PERMISSION_GROUPS[group] || [];
        setSelectedPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    };

    const savePermissions = async () => {
        if (!selectedStaff) return;
        try {
            setSavingPermissions(true);
            const res = await fetch(`/api/admin/staff/${selectedStaff.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customPermissions: selectedPermissions })
            });

            if (res.ok) {
                toast.success('Cập nhật quyền thành công');
                setShowPermissionModal(false);
                fetchStaff();
            } else {
                const data = await res.json();
                toast.error('Lỗi cập nhật quyền', data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
            toast.error('Lỗi khi cập nhật quyền', 'Vui lòng thử lại.');
        } finally {
            setSavingPermissions(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Đã sao chép mã nhân viên');
    };

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.roleType && ROLE_DEFINITIONS[s.roleType as keyof typeof ROLE_DEFINITIONS]?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCollaborators = collaboratorList.filter(collaborator =>
        collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.parentStaffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.parentStaffCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const revenueStaff = [...filteredStaff].sort((a, b) => b.teamRevenue - a.teamRevenue);

    const activeRecordCount = activeView === 'collaborators'
        ? filteredCollaborators.length
        : filteredStaff.length;

    const totalPages = Math.ceil(activeRecordCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedStaff = filteredStaff.slice(startIndex, startIndex + pageSize);
    const paginatedCollaborators = filteredCollaborators.slice(startIndex, startIndex + pageSize);
    const paginatedRevenueStaff = revenueStaff.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const totalStaff = staffList.length;
    const totalCTV = collaboratorList.length;
    const totalRevenue = staffList.reduce((sum, s) => sum + s.teamRevenue, 0);

    const selectView = (view: StaffView) => {
        setActiveView(view);
        setSearchTerm('');
        setCurrentPage(1);
        window.requestAnimationFrame(() => {
            document.getElementById('staff-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const getRoleColor = (roleType: string) => {
        return ROLE_DEFINITIONS[roleType as keyof typeof ROLE_DEFINITIONS]?.color || '#6b7280';
    };

    const getRoleName = (roleType: string) => {
        return ROLE_DEFINITIONS[roleType as keyof typeof ROLE_DEFINITIONS]?.name || roleType;
    };

    const exportColumns: ExportColumn<Staff>[] = [
        { key: 'staffCode', label: 'Mã nhân viên' },
        { key: 'name', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại', format: (v) => v || '-' },
        { key: 'roleType', label: 'Vai trò', format: (v) => getRoleName(v) },
        { key: 'collaboratorCount', label: 'Số CTV' },
        { key: 'teamOrders', label: 'Đơn hàng' },
        { key: 'teamRevenue', label: 'Doanh thu team', format: (v) => `${v.toLocaleString('vi-VN')}đ` },
        { key: 'createdAt', label: 'Ngày tạo', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '-' }
    ];

    const collaboratorExportColumns: ExportColumn<Collaborator>[] = [
        { key: 'referralCode', label: 'Mã CTV' },
        { key: 'name', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại', format: (v) => v || '-' },
        { key: 'parentStaffName', label: 'Nhân viên quản lý' },
        { key: 'parentStaffCode', label: 'Mã nhân viên' },
        { key: 'totalCommission', label: 'Tổng hoa hồng', format: (v) => `${v.toLocaleString('vi-VN')}đ` },
        { key: 'createdAt', label: 'Ngày tham gia', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '-' }
    ];

    useEffect(() => {
        setCurrentPage(1);
    }, [activeView, searchTerm]);

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDelete}
                title="Xóa nhân viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteModal.staffName}" và tất cả CTV của họ? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                isLoading={deleting !== null}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        Quản lý Nhân viên
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {totalStaff} nhân viên • {totalCTV} CTV • {totalRevenue.toLocaleString('vi-VN')}đ doanh thu team
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeView === 'collaborators' ? (
                        <ExportButton
                            data={filteredCollaborators}
                            columns={collaboratorExportColumns}
                            filename="cong-tac-vien"
                            disabled={filteredCollaborators.length === 0}
                        />
                    ) : (
                        <ExportButton
                            data={activeView === 'revenue' ? revenueStaff : filteredStaff}
                            columns={exportColumns}
                            filename={activeView === 'revenue' ? 'doanh-thu-team' : 'nhan-vien'}
                            disabled={filteredStaff.length === 0}
                        />
                    )}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-light/30 hover:bg-brand-light/50 text-slate-800 font-bold rounded-xl hover:shadow-md transition-all"
                    >
                        <Plus size={18} />
                        Thêm nhân viên
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    type="button"
                    onClick={() => selectView('staff')}
                    className={`bg-white rounded-xl p-4 shadow-sm border text-left cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand/30 ${activeView === 'staff' ? 'border-brand ring-2 ring-brand/20' : 'border-slate-100 hover:border-brand/40'}`}
                    aria-label="Xem danh sách nhân viên"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalStaff}</div>
                            <div className="text-sm text-slate-500">Nhân viên</div>
                        </div>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => selectView('collaborators')}
                    className={`bg-white rounded-xl p-4 shadow-sm border text-left cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand/30 ${activeView === 'collaborators' ? 'border-brand ring-2 ring-brand/20' : 'border-slate-100 hover:border-brand/40'}`}
                    aria-label="Xem nhân viên và cộng tác viên đang quản lý"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-light/30 flex items-center justify-center">
                            <Users className="w-5 h-5 text-brand-dark" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalCTV}</div>
                            <div className="text-sm text-slate-500">Tổng CTV</div>
                        </div>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => selectView('revenue')}
                    className={`bg-white rounded-xl p-4 shadow-sm border col-span-2 text-left cursor-pointer hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 ${activeView === 'revenue' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-100 hover:border-emerald-300'}`}
                    aria-label="Xem doanh thu theo từng nhân viên"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</div>
                            <div className="text-sm text-slate-500">Tổng doanh thu từ team</div>
                        </div>
                    </div>
                </button>
            </div>

            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={activeView === 'collaborators'
                    ? 'Tìm CTV theo tên, email, mã hoặc nhân viên quản lý...'
                    : activeView === 'revenue'
                        ? 'Tìm doanh thu theo tên hoặc mã nhân viên...'
                        : 'Tìm nhân viên theo tên, email, mã hoặc vai trò...'}
                className="max-w-xl"
            />
            {activeView === 'staff' && (
            <div id="staff-list" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden scroll-mt-24">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase w-16">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nhân viên</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã NV</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Vai trò</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">CTV</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Đơn hàng</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doanh thu team</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand" />
                                    </td>
                                </tr>
                            ) : paginatedStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <UserCheck className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">
                                                {searchTerm ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="text-sm text-brand hover:underline font-medium"
                                                >
                                                    Thêm nhân viên đầu tiên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedStaff.map((staff, index) => (
                                    <tr
                                        key={staff.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/users/${staff.id}`}
                                                className="flex items-center gap-3 rounded-lg -m-2 p-2 hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                aria-label={`Xem chi tiết nhân viên ${staff.name}`}
                                            >
                                                <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{staff.name}</div>
                                                    <div className="text-xs text-slate-500">{staff.email}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm bg-brand/10 text-brand px-2 py-1 rounded font-bold">
                                                    {staff.staffCode}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyCode(staff.staffCode);
                                                    }}
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Sao chép mã"
                                                >
                                                    <Copy size={14} className="text-slate-500" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                                style={{
                                                    backgroundColor: `${getRoleColor(staff.roleType)}20`,
                                                    color: getRoleColor(staff.roleType)
                                                }}
                                            >
                                                {getRoleName(staff.roleType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-brand">{staff.collaboratorCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-800">{staff.teamOrders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                {staff.teamRevenue.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openPermissionModal(staff)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Phân quyền"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                                <Link
                                                    href={`/admin/users/${staff.id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-2 text-brand hover:bg-brand/10 rounded-lg transition-colors text-xs font-semibold"
                                                    title="Chi tiết"
                                                >
                                                    <span>Chi tiết</span>
                                                    <ChevronRight size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(staff.id, staff.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    disabled={deleting === staff.id}
                                                    title="Xóa"
                                                >
                                                    {deleting === staff.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={filteredStaff.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    isLoading={loading}
                />
            </div>
            )}

            {activeView === 'collaborators' && (
                <div id="staff-list" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden scroll-mt-24">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800">Danh sách cộng tác viên</h2>
                        <p className="text-sm text-slate-500 mt-1">Hiển thị CTV và nhân viên đang trực tiếp quản lý.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase w-16">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Cộng tác viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã CTV</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nhân viên quản lý</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hoa hồng</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ngày tham gia</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand" /></td></tr>
                                ) : paginatedCollaborators.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">{searchTerm ? 'Không tìm thấy cộng tác viên' : 'Chưa có cộng tác viên nào'}</td></tr>
                                ) : paginatedCollaborators.map((collaborator, index) => (
                                    <tr key={collaborator.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">{startIndex + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/users/${collaborator.id}`} className="block rounded-lg -m-2 p-2 hover:bg-brand/5">
                                                <div className="font-medium text-slate-800">{collaborator.name}</div>
                                                <div className="text-xs text-slate-500">{collaborator.email}{collaborator.phone ? ` • ${collaborator.phone}` : ''}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4"><span className="font-mono text-sm bg-brand/10 text-brand px-2 py-1 rounded font-bold">{collaborator.referralCode || '-'}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{collaborator.parentStaffName}</div>
                                            <div className="text-xs text-slate-500 font-mono">{collaborator.parentStaffCode || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">{collaborator.totalCommission.toLocaleString('vi-VN')}đ</td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600">{new Date(collaborator.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={`/admin/users/${collaborator.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 text-brand hover:bg-brand/10 rounded-lg text-xs font-semibold">
                                                Chi tiết <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRecords={filteredCollaborators.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        isLoading={loading}
                    />
                </div>
            )}

            {activeView === 'revenue' && (
                <div id="staff-list" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden scroll-mt-24">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="font-bold text-slate-800">Doanh thu theo team</h2>
                            <p className="text-sm text-slate-500 mt-1">Tổng hợp đơn hàng và doanh thu của từng nhân viên cùng CTV trực thuộc.</p>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase w-16">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nhân viên / Team</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">CTV</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Đơn hàng</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doanh thu team</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hoa hồng NV</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></td></tr>
                                ) : paginatedRevenueStaff.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">{searchTerm ? 'Không tìm thấy dữ liệu doanh thu' : 'Chưa có dữ liệu doanh thu team'}</td></tr>
                                ) : paginatedRevenueStaff.map((staff, index) => (
                                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">{startIndex + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/users/${staff.id}`} className="block rounded-lg -m-2 p-2 hover:bg-emerald-50">
                                                <div className="font-medium text-slate-800">{staff.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{staff.staffCode}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-brand">{staff.collaboratorCount}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">{staff.teamOrders}</td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">{staff.teamRevenue.toLocaleString('vi-VN')}đ</td>
                                        <td className="px-6 py-4 text-right font-semibold text-amber-600">{staff.totalCommission.toLocaleString('vi-VN')}đ</td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={`/admin/users/${staff.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 text-brand hover:bg-brand/10 rounded-lg text-xs font-semibold">
                                                Chi tiết <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRecords={filteredStaff.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        isLoading={loading}
                    />
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center text-white">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Thêm Nhân viên mới</h2>
                                <p className="text-sm text-slate-500">Cấp mã và vai trò cho nhân viên</p>
                            </div>
                        </div>

                        <form onSubmit={createStaff} className="space-y-4">
                            <div className="rounded-xl border border-brand-light/60 bg-brand-light/20 px-4 py-3 text-sm text-slate-700">
                                <span className="font-semibold">Mã nhân viên:</span> hệ thống sẽ tự tạo sau khi lưu (ví dụ NV000001).
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                                <select
                                    value={newStaff.roleType}
                                    onChange={(e) => setNewStaff({ ...newStaff, roleType: e.target.value as RoleType })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                >
                                    {ROLE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    {ROLE_OPTIONS.find(o => o.value === newStaff.roleType)?.description}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <span className="text-xs">Ẩn</span> : <span className="text-xs">Hiện</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 bg-brand-light/30 hover:bg-brand-light/50 text-slate-800 font-bold rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo nhân viên'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPermissionModal && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPermissionModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <button
                            onClick={() => setShowPermissionModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Phân quyền nhân viên</h2>
                                <p className="text-sm text-slate-500">{selectedStaff.name} - {getRoleName(selectedStaff.roleType)}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                                <div key={group} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => togglePermissionGroup(group)}
                                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-medium text-slate-700">{group}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                {permissions.filter(p => selectedPermissions.includes(p)).length}/{permissions.length}
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                className={`text-slate-400 transition-transform ${expandedGroups.includes(group) ? 'rotate-90' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {expandedGroups.includes(group) && (
                                        <div className="p-3 bg-white">
                                            <div className="flex gap-2 mb-3">
                                                <button
                                                    onClick={() => selectAllInGroup(group)}
                                                    className="text-xs text-brand hover:underline"
                                                >
                                                    Chọn tất cả
                                                </button>
                                                <span className="text-slate-300">|</span>
                                                <button
                                                    onClick={() => deselectAllInGroup(group)}
                                                    className="text-xs text-slate-500 hover:underline"
                                                >
                                                    Bỏ chọn tất cả
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {permissions.map(permission => (
                                                    <label
                                                        key={permission}
                                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                                            selectedPermissions.includes(permission)
                                                                ? 'bg-brand/10 border border-brand/20'
                                                                : 'hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission)}
                                                            onChange={() => togglePermission(permission)}
                                                            className="w-4 h-4 text-brand rounded border-slate-300 focus:ring-brand"
                                                        />
                                                        <span className="text-sm text-slate-700">{permission}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200">
                            <button
                                onClick={() => setShowPermissionModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={savePermissions}
                                disabled={savingPermissions}
                                className="flex-1 px-4 py-2.5 bg-brand-light/30 hover:bg-brand-light/50 text-slate-800 font-bold rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {savingPermissions ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu quyền'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

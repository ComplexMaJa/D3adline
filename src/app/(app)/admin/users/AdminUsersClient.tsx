"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Profile, UserRole } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { adminSetUserRole } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import {
  Users,
  Search,
  ArrowLeft,
  Shield,
  ShieldAlert,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface AdminUsersClientProps {
  initialProfiles: Profile[];
}

export function AdminUsersClient({ initialProfiles }: AdminUsersClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const isId = language === "id";

  const [profiles, setProfiles] = React.useState<Profile[]>(initialProfiles);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  // Role Edit Modal state
  const [selectedUser, setSelectedUser] = React.useState<Profile | null>(null);
  const [newRole, setNewRole] = React.useState<UserRole>("student");
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  const filteredProfiles = React.useMemo(() => {
    return profiles.filter((p) => {
      if (roleFilter !== "all" && p.role !== roleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = p.display_name?.toLowerCase() || "";
        const email = p.email?.toLowerCase() || "";
        const inst = p.institution?.toLowerCase() || "";
        if (!name.includes(q) && !email.includes(q) && !inst.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [profiles, roleFilter, searchQuery]);

  const handleOpenRoleModal = (user: Profile) => {
    setSelectedUser(user);
    setNewRole(user.role || "student");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newRole === selectedUser.role) {
      setSelectedUser(null);
      return;
    }

    setIsUpdatingRole(true);
    setErrorMsg(null);

    try {
      await adminSetUserRole(selectedUser.id, newRole);

      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedUser.id ? { ...p, role: newRole } : p))
      );

      setSuccessMsg(
        isId
          ? `Peran ${selectedUser.display_name || selectedUser.email} berhasil diubah ke ${newRole}.`
          : `Successfully updated role for ${selectedUser.display_name || selectedUser.email} to ${newRole}.`
      );

      setTimeout(() => {
        setSelectedUser(null);
        setSuccessMsg(null);
      }, 1500);

      router.refresh();
    } catch (err: unknown) {
      console.error("Error updating user role:", err);
      const msg = err instanceof Error ? err.message : "Failed to update role";
      setErrorMsg(msg);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const renderRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-950/60 border border-rose-800/60 text-rose-300">
            Admin
          </span>
        );
      case "teacher":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-950/60 border border-purple-800/60 text-purple-300">
            {isId ? "Pengajar" : "Teacher"}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            {isId ? "Siswa" : "Student"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{isId ? "Kembali ke Beranda Admin" : "Back to Admin Console"}</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-purple-400" />
            <span>{isId ? "Manajemen Pengguna" : "User Directory & Roles"}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isId
              ? "Kelola akun pengguna, tetapkan peran pengajar atau admin, dan pantau instansi."
              : "Inspect registered accounts, assign teacher or admin privileges, and manage directory."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#0A0A0C] border border-[#1E1E22] px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span>{isId ? "Total Terdaftar:" : "Total Registered:"}</span>
          <span className="font-bold text-white">{profiles.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#1E1E22] bg-[#0A0A0C]">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isId
                ? "Cari nama, email, atau instansi..."
                : "Search by name, email, or institution..."
            }
            className="w-full bg-[#121214] border border-[#222226] focus:border-purple-500/60 text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none placeholder:text-zinc-600 transition-colors"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#121214] border border-[#222226] overflow-x-auto">
          {[
            { id: "all", label: isId ? "Semua" : "All" },
            { id: "student", label: isId ? "Siswa" : "Students" },
            { id: "teacher", label: isId ? "Pengajar" : "Teachers" },
            { id: "admin", label: "Admin" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoleFilter(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                roleFilter === item.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / List */}
      {filteredProfiles.length === 0 ? (
        <EmptyState
          title={isId ? "Pengguna tidak ditemukan" : "No users found"}
          description={
            isId
              ? "Tidak ada akun pengguna yang cocok dengan kriteria pencarian Anda."
              : "No user accounts match your search or filter criteria."
          }
        />
      ) : (
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121216] border-b border-[#1E1E24] text-zinc-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">{isId ? "Pengguna" : "User"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Peran" : "Role"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Institusi" : "Institution"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Terdaftar" : "Registered"}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isId ? "Aksi" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181C]">
                {filteredProfiles.map((user) => {
                  const userName = user.display_name || user.email?.split("@")[0] || "User";
                  const initials = userName
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <tr key={user.id} className="hover:bg-[#121216]/60 transition-colors">
                      {/* Name and Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatar_url}
                              alt={userName}
                              className="h-9 w-9 rounded-full object-cover border border-[#2A2A2E] shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-950/60 to-indigo-950/60 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 truncate">{userName}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4">
                        {user.institution ? (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.institution}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">—</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {user.created_at
                          ? format(parseISO(user.created_at), isId ? "d MMM yyyy" : "MMM d, yyyy")
                          : "—"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRoleModal(user)}
                          className="h-7 text-xs gap-1.5 border-[#2A2A2E] hover:border-purple-500/40"
                        >
                          <Shield className="h-3 w-3 text-zinc-400" />
                          <span>{isId ? "Ubah Peran" : "Change Role"}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-[#18181C]">
            {filteredProfiles.map((user) => {
              const userName = user.display_name || user.email?.split("@")[0] || "User";
              const initials = userName
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U";

              return (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{userName}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {renderRoleBadge(user.role)}
                  </div>

                  {user.institution && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Building2 className="h-3 w-3 text-zinc-500" />
                      <span>{user.institution}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {user.created_at
                        ? format(parseISO(user.created_at), isId ? "d MMM yyyy" : "MMM d, yyyy")
                        : ""}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRoleModal(user)}
                      className="h-7 text-xs gap-1"
                    >
                      <Shield className="h-3 w-3 text-zinc-400" />
                      <span>{isId ? "Ubah Peran" : "Change Role"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={isId ? "Ubah Peran Pengguna" : "Update User Authorization Role"}
          description={
            isId
              ? `Tentukan hak akses untuk ${selectedUser.display_name || selectedUser.email}.`
              : `Modify access privileges for ${selectedUser.display_name || selectedUser.email}.`
          }
        >
          <form onSubmit={handleSaveRole} className="space-y-4 pt-2">
            {/* User Details Banner */}
            <div className="p-3 rounded-xl border border-[#1E1E24] bg-[#121216] space-y-1">
              <p className="text-xs font-semibold text-zinc-200">
                {selectedUser.display_name || selectedUser.email}
              </p>
              <p className="text-[11px] text-zinc-400">{selectedUser.email}</p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">
                  {isId ? "Peran saat ini:" : "Current role:"}
                </span>
                {renderRoleBadge(selectedUser.role)}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Select Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                {isId ? "Pilih Peran Baru" : "Select New Role"}
              </label>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="student">
                  {isId ? "Siswa (Akses dashboard, kelas, dan pengumpulan tugas)" : "Student (Dashboard, enrolled classes, submit assignments)"}
                </option>
                <option value="teacher">
                  {isId ? "Pengajar (Membuat kelas, memberi tugas, dan menilai)" : "Teacher (Create classes, assign tasks, grade submissions)"}
                </option>
                <option value="admin">
                  {isId ? "Administrator (Akses penuh ke seluruh sistem)" : "Admin (Full unrestricted platform access)"}
                </option>
              </Select>
            </div>

            {/* Elevation Warning */}
            {newRole === "admin" && selectedUser.role !== "admin" && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {isId
                    ? "Perhatian: Memberikan peran Admin akan mengizinkan pengguna ini mengelola semua pengguna, melihat semua kelas, dan mengubah konfigurasi sistem."
                    : "Caution: Elevating to Admin grants full access to all system data, user credentials, classes, and system actions."}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1C1C20]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                disabled={isUpdatingRole}
              >
                {isId ? "Batal" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdatingRole}
                className="gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>
                  {isUpdatingRole
                    ? (isId ? "Memperbarui..." : "Updating...")
                    : (isId ? "Simpan Peran" : "Save Role")}
                </span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

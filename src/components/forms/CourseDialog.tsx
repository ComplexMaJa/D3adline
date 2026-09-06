"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Course } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Hash, User, FileText, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSaved?: (course: Course) => void;
}

const PRESET_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Emerald", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Fuchsia", value: "#D946EF" },
];

export function CourseDialog({
  isOpen,
  onClose,
  courseToEdit,
  onSaved,
}: CourseDialogProps) {
  const { t } = useLanguage();
  const isEditing = !!courseToEdit;
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [instructor, setInstructor] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState(PRESET_COLORS[0].value);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const supabase = createClient();

  React.useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name || "");
      setCode(courseToEdit.code || "");
      setInstructor(courseToEdit.instructor || "");
      setDescription(courseToEdit.description || "");
      setColor(courseToEdit.color || PRESET_COLORS[0].value);
    } else {
      setName("");
      setCode("");
      setInstructor("");
      setDescription("");
      setColor(PRESET_COLORS[0].value);
    }
    setErrors({});
  }, [courseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = t.dialogs.course.errors.nameRequired;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrors({ form: t.dialogs.course.errors.authRequired });
        setIsLoading(false);
        return;
      }

      if (isEditing && courseToEdit) {
        const { data, error } = await supabase
          .from("courses")
          .update({
            name: name.trim(),
            code: code.trim() || null,
            instructor: instructor.trim() || null,
            description: description.trim() || null,
            color,
            updated_at: new Date().toISOString(),
          })
          .eq("id", courseToEdit.id)
          .select()
          .single();

        if (error) throw error;
        if (onSaved && data) onSaved(data);
      } else {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            user_id: user.id,
            name: name.trim(),
            code: code.trim() || null,
            instructor: instructor.trim() || null,
            description: description.trim() || null,
            color,
          })
          .select()
          .single();

        if (error) throw error;
        if (onSaved && data) onSaved(data);
      }

      onClose();
    } catch (err: unknown) {
      console.error("Error saving course:", err);
      const errorMessage = err instanceof Error ? err.message : t.dialogs.course.errors.saveFailed;
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t.dialogs.course.editTitle : t.dialogs.course.createTitle}
      description={
        isEditing
          ? t.dialogs.course.editDesc
          : t.dialogs.course.createDesc
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400">
            {errors.form}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            {t.dialogs.course.nameLabel} <span className="text-purple-400">*</span>
          </label>
          <Input
            placeholder={t.dialogs.course.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            leftIcon={<BookOpen className="h-4 w-4" />}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {t.dialogs.course.codeLabel}
            </label>
            <Input
              placeholder={t.dialogs.course.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              leftIcon={<Hash className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {t.dialogs.course.instructorLabel}
            </label>
            <Input
              placeholder={t.dialogs.course.instructorPlaceholder}
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            {t.dialogs.course.colorLabel}
          </label>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className="h-7 w-7 rounded-full transition-transform flex items-center justify-center relative hover:scale-110 active:scale-95"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {color === c.value && (
                  <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            {t.dialogs.course.descLabel}
          </label>
          <Textarea
            placeholder={t.dialogs.course.descPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181818]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? t.dialogs.course.saveBtn : t.dialogs.course.createBtn}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Category } from "@/schemas/library";
import { getAllCategories } from "@/services/api/categories";

interface CategorySelectProps {
  value?: string;
  onValueChange: (categoryId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const CategorySelect = ({
  value,
  onValueChange,
  label = "Category",
  placeholder = "Select a category",
  required = false,
}: CategorySelectProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className={label ? "space-y-2" : ""}>
      {label && (
        <Label htmlFor="category-select">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={loading}
      >
        <SelectTrigger id="category-select">
          <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categories.length === 0 && !loading && (
        <p className="text-sm text-gray-500">
          No categories available. Please create categories first.
        </p>
      )}
    </div>
  );
};
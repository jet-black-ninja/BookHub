import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Category } from "@/schemas/library";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
} from "@/services/api/categories";

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<CreateCategoryPayload>({
    name: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState<CreateCategoryPayload>({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      console.log('Fetched categories:', data); // Debug log
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      alert("Failed to fetch categories");
      setCategories([]); // Ensure categories is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    try {
      setAdding(true);
      await createCategory(newCategory);
      setNewCategory({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category:", err);
      alert("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingCategory.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    try {
      await updateCategory(id, editingCategory);
      setEditingId(null);
      setEditingCategory({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory({
      name: category.name,
      description: category.description || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory({ name: "", description: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Categories Management</h1>

      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter category description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
            />
          </div>
          <Button onClick={handleAddCategory} disabled={adding}>
            {adding ? "Adding..." : "Add Category"}
          </Button>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(categories) && categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId === category.id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    className="text-lg font-semibold"
                  />
                ) : (
                  category.name
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingId === category.id ? (
                <Textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Category description"
                />
              ) : (
                <p className="text-gray-600">
                  {category.description || "No description"}
                </p>
              )}
              
              {category._count && (
                <p className="text-sm text-gray-500">
                  Books: {category._count.books}
                </p>
              )}

              <div className="flex gap-2">
                {editingId === category.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleEditCategory(category.id)}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Array.isArray(categories) && categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No categories found. Add your first category above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
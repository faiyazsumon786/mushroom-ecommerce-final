// src/app/(dashboard)/admin/components/UserActions.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UserActions({ userId }: { userId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    // console.log("Delete user:", userId);
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });
        // console.log({ response });
        if (response.ok) {
          alert("User deleted successfully!");
          router.refresh(); // Refresh the page to show the updated list
        } else {
          const data = await response.json();
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to connect to the server.");
      }
    }
  };

  const handleEdit = () => {
    alert("Edit functionality is coming soon!");
    // ভবিষ্যতে এখানে একটি modal বা এডিট পেজে redirect করার কোড থাকবে
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleEdit}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Delete
      </button>
    </div>
  );
}

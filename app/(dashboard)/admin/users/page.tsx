// src/app/(dashboard)/admin/page.tsx
import CreateUserForm from "../components/CreateUserForm";
import UserActions from "../components/UserActions"; // <-- Import the new component
import { PrismaClient, Role } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return users;
}

export default async function AdminPage() {
  const users = await getUsers();

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-red-100 text-red-800";
      case Role.EMPLOYEE:
        return "bg-blue-100 text-blue-800";
      case Role.SUPPLIER:
        return "bg-green-100 text-green-800";
      case Role.WHOLESALER:
        return "bg-yellow-100 text-yellow-800";
      case Role.CUSTOMER:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // console.log({ users });
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">User Management</h1>
      <p className="text-lg text-gray-600">
        Effortlessly manage all users, including employees, suppliers,
        wholesalers, and customers.
      </p>

      <CreateUserForm />

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">
          Existing Users
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-lg">
            No users found. Create your first user above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Created At</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Actions
                  </th>{" "}
                  {/* Align to right */}
                </tr>
              </thead>
              <tbody className="text-gray-700 text-base font-light">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  >
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(user.createdAt), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <UserActions userId={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

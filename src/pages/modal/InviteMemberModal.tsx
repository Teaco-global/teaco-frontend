import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { backendBaseUrl } from "../../config";

<div>
  <Toaster />
</div>;
interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

    const inviteMemberResponse = await axios.post(
        `${backendBaseUrl}/teaco/api/v1/user-workspace/invite-member`,
        {
          name,
          email,
          role,
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      console.log(inviteMemberResponse);
      const inviteMemberSuccessMessage = inviteMemberResponse.data?.message
      toast.success(inviteMemberSuccessMessage)
      setName("");
      setEmail("");
      setRole("member");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to invite member";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-full max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-2xl font-semibold">Invite Member</h3>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="relative flex-auto p-6">
          <div className="mb-4">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                Full Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter member's full name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member's email"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "member")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              >
                <option className="hover:bg-[#0D00A8 text-white" value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 mb-1 mr-4 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 outline-none background-transparent focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 mb-1 text-sm font-normal text-white rounded shadow outline-none bg-[#0D00A8] hover:bg-[#0D00A8]/90 focus:outline-none ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Inviting..." : "Invite Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster/>
    </div>
  );
};

export default InviteMemberModal;

import React, { useState } from "react";
import axios from "axios";
import { backendBaseUrl } from "../../config";
import { IssueTypeEnum, PriorityEnum } from "../../enum";
import { toast } from "react-toastify";

interface WorkspaceMember {
  id: number;  // This is the userWorkspaceId
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface AddIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  activeSprint?: any;
  workspaceMembers: WorkspaceMember[];
}

const AddIssueModal: React.FC<AddIssueModalProps> = ({
  isOpen,
  onClose,
  projectId,
  activeSprint,
  workspaceMembers
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueTypeEnum>(IssueTypeEnum.TASK);
  const [priority, setPriority] = useState<PriorityEnum>(PriorityEnum.LOW);
  const [estimatedPoints, setEstimatedPoints] = useState<number>(1);
  const [assignedToId, setAssignedToId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

    try {
      const data: {
        title: string;
        description: string;
        type: IssueTypeEnum;
        sprintId?: number;
        estimatedPoints: number;
        priority: PriorityEnum;
        assignedToId?: number;
      } = {
        title,
        description,
        type,
        estimatedPoints,
        priority,
      };

      if (activeSprint && activeSprint.id) {
        data.sprintId = Number(activeSprint.id);
      }

      if (assignedToId) {
        data.assignedToId = assignedToId;
      }

      await axios.post(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues`,
        data,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      toast.success("Issue created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              rows={4}
            />
          </div>

          <div>
            <label
              htmlFor="assignee"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Assignee
            </label>
            <select
              id="assignee"
              value={assignedToId || ""}
              onChange={(e) => setAssignedToId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
            >
              <option value="">Unassigned</option>
              {workspaceMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Issue Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as IssueTypeEnum)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
            >
              {Object.values(IssueTypeEnum).map((issueType) => (
                <option key={issueType} value={issueType}>
                  {issueType.toLocaleLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityEnum)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
            >
              {Object.values(PriorityEnum).map((priorityType) => (
                <option key={priorityType} value={priorityType}>
                  {priorityType.toLocaleLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="estimatedPoints"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Estimated Point
            </label>
            <input
              id="estimatedPoints"
              value={estimatedPoints}
              type="number"
              min="1"
              max="13"
              onChange={(e) => setEstimatedPoints(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0D00A8] rounded-md hover:bg-[#1D00A8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D00A8]"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIssueModal;
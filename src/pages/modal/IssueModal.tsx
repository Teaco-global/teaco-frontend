import React, { useState } from "react";
import axios from "axios";
import { backendBaseUrl } from "../../config";
import { IssueTypeEnum, PriorityEnum } from "../../enum";
import { toast } from "react-toastify";

interface IssueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: any;
  projectId: string;
  onIssueUpdate?: () => void;
}

const IssueModal: React.FC<IssueDetailsModalProps> = ({
  isOpen,
  onClose,
  issue,
  projectId,
  onIssueUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(issue?.title || "");
  const [description, setDescription] = useState(issue?.description || "");
  const [type, setType] = useState<IssueTypeEnum>(
    issue?.type || IssueTypeEnum.TASK
  );
  const [priority, setPriority] = useState<PriorityEnum>(
    issue?.priority || PriorityEnum.LOW 
  );
  const [estimatedPoints, setestimatedPoints] = useState<number>(1);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

    try {
      await axios.put(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues/${issue.id}`,
        {
          title,
          description,
          type,
          priority,
          estimatedPoints
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      toast.success("Issue updated successfully!");
      onIssueUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating issue:", error);
      toast.error("Failed to update issue.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this issue?"
    );
    if (!confirmDelete) return;

    const accessToken = localStorage.getItem("accessToken");
    const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

    try {
      await axios.delete(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues/${issue.id}`,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      toast.success("Issue deleted successfully!");
      onClose();
      onIssueUpdate?.();
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast.error("Failed to delete issue.");
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[600px] max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">SCRUM-{issue.issueCount}</h2>
          <div className="space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-[#0D00A8] text-white rounded"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IssueTypeEnum)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {Object.values(IssueTypeEnum).map((issueType) => (
                <option key={issueType} value={issueType}>
                  {issueType.toLocaleLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityEnum)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {Object.values(PriorityEnum).map((priorityLevel) => (
                <option key={priorityLevel} value={priorityLevel}>
                  {priorityLevel.toLocaleLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Point
            </label>
            <input
              type="number"
              min="1"
              max="13"
              value={estimatedPoints}
              onChange={(e) => setestimatedPoints(parseFloat(e.target.value) as number)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
            </input>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(issue.title);
                  setDescription(issue.description);
                  setType(issue.type);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-[#0D00A8] rounded-md hover:bg-[#1D00A8]"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;

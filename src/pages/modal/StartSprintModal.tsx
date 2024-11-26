import axios from "axios";
import React, { useState } from "react";
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import { backendBaseUrl } from "../../config";
import toast, {Toaster} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

<div><Toaster/></div>

interface StartSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  sprintId: string;
  onStartSprint?: (goal: string, dueDate: Date) => void;
}

const StartSprintModal: React.FC<StartSprintModalProps> = ({
  isOpen,
  onClose,
  projectId,
  sprintId,
}) => {
  const [goal, setGoal] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

    if (!goal || !dueDate) {
      alert("Please enter a goal and select a due date.");
      return;
    }

    try{
      await axios.put(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/sprints/${sprintId}/start`,
        {
          goal: goal,
          dueDate: new Date(dueDate)
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      toast.success("Issue created successfully!");
      onClose();
      navigate(`/projects/${projectId}/boards`)
    } catch(error:any) {
      console.error(error.response?.data?.message)
      toast.error(error.response?.data?.message)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Start New Sprint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sprint Goal
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              rows={4}
              required
            />
          </div>

          <div>
            <label
              htmlFor="due-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date
            </label>
            <DatePicker
              id="due-date"
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D00A8]"
              required
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
              Start Sprint
            </button>
          </div>
        </form>
      </div>
      <Toaster/>
    </div>
  );
};

export default StartSprintModal;

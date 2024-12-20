import React, { useState } from "react";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import Checkbox from "../../components/UI/Checkbox";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channelName: string, isPublic: boolean, selectedUsers: string[]) => void;
  activeFilteredMembers: any[]; // Replace 'any' with proper type for members
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateChannel, 
  activeFilteredMembers 
}) => {
  const [channelName, setChannelName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateChannel = () => {
    if (channelName.trim()) {
      onCreateChannel(channelName, isPublic, selectedUsers);
      setChannelName("");
      setIsPublic(true);
      setSelectedUsers([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Create New Channel</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Channel Name</label>
            <Input 
              value={channelName} 
              onChange={(e) => setChannelName(e.target.value)} 
              placeholder="Enter channel name" 
            />
          </div>
          <div>
            <Checkbox 
              label="Public Channel" 
              checked={isPublic} 
              onChange={setIsPublic} 
            />
          </div>
          <div>
            <label className="block mb-2">Select Channel Members</label>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {activeFilteredMembers.map((member: any) => (
                <div key={member.user.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    label={member.user.name} 
                    checked={selectedUsers.includes(member.id)} 
                    onChange={() => toggleUserSelection(member.id)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
            <Button 
                onClick={handleCreateChannel} 
                disabled={!channelName.trim()} 
                className="w-full"
            >
                + Create Channel
            </Button>
          <Button onClick={onClose} className="bg-gray-300 text-[black]">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;

import React, { useState, useEffect } from "react";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import Checkbox from "../../components/UI/Checkbox";

interface UpdateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateChannel: (channelName: string, isPublic: boolean, selectedUsers: string[]) => void;
  activeFilteredMembers: any[];
  currentChannel: {
    name: string;
    isPublic: boolean;
    members: string[];
  };
}

const UpdateChannelModal: React.FC<UpdateChannelModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdateChannel, 
  activeFilteredMembers, 
  currentChannel 
}) => {
  const [channelName, setChannelName] = useState(currentChannel.name);
  const [isPublic, setIsPublic] = useState(currentChannel.isPublic);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentChannel.members);

  useEffect(() => {
    setChannelName(currentChannel.name);
    setIsPublic(currentChannel.isPublic);
    setSelectedUsers(currentChannel.members);
  }, [currentChannel]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleUpdateChannel = () => {
    if (channelName.trim()) {
      onUpdateChannel(channelName, isPublic, selectedUsers);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Update Channel</h2>
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
            onClick={handleUpdateChannel} 
            disabled={!channelName.trim()} 
            className="w-full"
          >
            Save Changes
          </Button>
          <Button onClick={onClose} className="bg-gray-300 text-[black]">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateChannelModal;

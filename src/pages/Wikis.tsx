import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import { backendBaseUrl } from "../config";
import toast, { Toaster } from "react-hot-toast";

import 'react-toastify/dist/ReactToastify.css';

interface Wiki {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
} 

interface WikiUserWorkspace {
  id: string;
  wiki: Wiki;
}

<div>
  <Toaster />
</div>;

const Wikis: React.FC = () => {
  const [wikiUserWorkspaces, setWikiUserWorkspaces] = useState<WikiUserWorkspace[]>([]);
  const [selectedWiki, setSelectedWiki] = useState<Wiki | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");
  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  useEffect(() => {
    fetchWikis();
  }, [page]);

  const fetchWikis = async () => {
    try {
      const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/wiki`, {
        params: {
          offset: (page - 1) * limit,
          limit,
          sort: 'DESC',
          order: 'createdAt'
        },
        headers: {
          Authorization: `${accessToken}`,
          'x-workspace-secret-id': `${workspaceSecret}`,
        },
      });

      console.log(response.data.data)
      setWikiUserWorkspaces(response.data.data || []);
    } catch (error) {
      console.error("Error fetching wikis:", error);
      toast.error("Error fetching wikis");
    }
  };

  const handleCreateWiki = async () => {
    try {
      const response = await axios.post(
        `${backendBaseUrl}/teaco/api/v1/wiki`,
        { 
          title: `New Wiki ${wikiUserWorkspaces.length + 1}`, 
          content: "" 
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            'x-workspace-secret-id': `${workspaceSecret}`,
          },
        }
      );
      const newWiki = response.data.data;
      await fetchWikis();
      setSelectedWiki(newWiki);
      setContent("");
      toast.success('Wiki created successfully');
    } catch (error) {
      console.error("Error creating wiki:", error);
      toast.error("Error creating wiki");
    }
  };

  const handleUpdateWiki = async () => {
    if (!selectedWiki) return;
    try {
      await axios.put(
        `${backendBaseUrl}/teaco/api/v1/wiki/${selectedWiki.id}`,
        { 
          title: selectedWiki.title,
          content
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            'x-workspace-secret-id': `${workspaceSecret}`,
          },
        }
      );
      toast.success('Wiki updated successfully');
      fetchWikis();
    } catch (error) {
      console.error({error})
      console.error("Error updating wiki:", error);
      toast.error("Error updating wiki");
    }
  };

  const handleDeleteWiki = async (id: string) => {
    try {
      await axios.delete(`${backendBaseUrl}/teaco/api/v1/wiki/${id}`, {
        headers: {
          Authorization: `${accessToken}`,
          'x-workspace-secret-id': `${workspaceSecret}`,
        },
      });
      toast.success('Wiki deleted successfully');
      // setWikis(wikis.filter(wiki => wiki.id !== id));
      if (selectedWiki?.id === id) {
        setSelectedWiki(null);
      }

      fetchWikis()
    } catch (error) {
      console.error("Error deleting wiki:", error);
      toast.error("Error deleting wiki");
    }
  };

  const handleWikiClick = async (wiki: Wiki) => {
    try {
      const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/wiki/${wiki.id}`, {
        headers: {
          Authorization: `${accessToken}`,
          'x-workspace-secret-id': `${workspaceSecret}`,
        },
      });
      setSelectedWiki(response.data.data);
      setContent(response.data.data.content);
    } catch (error) {
      console.error("Error fetching wiki:", error);
      toast.error("Error fetching wiki details");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (selectedWiki && content !== selectedWiki.content) {
        handleUpdateWiki();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [content]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {wikiUserWorkspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                You don't have any wikis yet.
              </h2>
              <p className="text-2xl text-gray-500 mb-4">
                Start by creating your first wiki
              </p>
              <button
                className="bg-[#0D00A8] text-white px-4 py-2 rounded"
                onClick={handleCreateWiki}
              >
                Create Wiki +
              </button>
            </div>
          ) : (
            <div className="h-full">
              {!selectedWiki ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-normal">Wikis</h1>
                    <button
                      className="bg-[#0D00A8] text-white px-4 py-2 rounded"
                      onClick={handleCreateWiki}
                    >
                      Create Wiki +
                    </button>
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search wikis..."
                      className="w-full px-4 py-2 border rounded"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wikiUserWorkspaces
                      .filter(wikiUserWorkspace => 
                        wikiUserWorkspace.wiki.title.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(wikiUserWorkspace => (
                        <div
                          key={wikiUserWorkspace.id}
                          className="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleWikiClick(wikiUserWorkspace.wiki)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-[#0D00A8]">
                              {wikiUserWorkspace.wiki.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWiki(wikiUserWorkspace.wiki.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Last updated: {formatDate(wikiUserWorkspace.wiki.updatedAt)}
                          </p>
                        </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold">{selectedWiki.title}</h2>
                      <input
                        type="text"
                        value={selectedWiki.title}
                        onChange={(e) => {
                          setSelectedWiki({
                            ...selectedWiki,
                            title: e.target.value
                          });
                        }}
                        className="ml-4 px-2 py-1 border rounded"
                        onBlur={handleUpdateWiki}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWiki(null)
                        fetchWikis();
                      }}
                      className="bg-[#0D00A8] text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  </div>
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    className="h-[calc(100vh-300px)]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        [{ align: [] }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Wikis;
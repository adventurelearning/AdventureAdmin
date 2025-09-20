import React, { useState } from 'react';
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { FiEdit3, FiTrash2, FiX, FiPlus, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';

// GraphQL Queries and Mutations
const GET_TOPICS = gql`
  query GetTopics {
    blogTopics {
      id
      topic
      order
    }
  }
`;

const CREATE_TOPIC = gql`
  mutation CreateBlogTopic($topic: String!, $order: Int!) {
    createBlogTopic(topic: $topic, order: $order) {
      id
      topic
      order
    }
  }
`;

const UPDATE_TOPIC = gql`
  mutation UpdateBlogTopic($id: ID!, $topic: String, $order: Int) {
    updateBlogTopic(id: $id, topic: $topic, order: $order) {
      id
      topic
      order
    }
  }
`;

const DELETE_TOPIC = gql`
  mutation DeleteBlogTopic($id: ID!) {
    deleteBlogTopic(id: $id)
  }
`;

const BlogTopicModel = ({ setShowModal, toast, refetchTopics }) => {
  const [newTopic, setNewTopic] = useState({ topic: "", order: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_TOPICS);
  const [createTopic] = useMutation(CREATE_TOPIC);
  const [updateTopic] = useMutation(UPDATE_TOPIC);
  const [deleteTopic] = useMutation(DELETE_TOPIC);

  if (error) {
    toast.error("Failed to fetch blog topics");
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic((prevTopic) => ({
      ...prevTopic,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTopic({
          variables: {
            id: editTopic.id,
            topic: newTopic.topic,
            order: newTopic.order
          }
        });
        toast.success("Blog topic updated successfully");
      } else {
        await createTopic({
          variables: {
            topic: newTopic.topic,
            order: newTopic.order
          }
        });
        toast.success("Blog topic added successfully");
      }
      
      refetch();
      if (refetchTopics) refetchTopics();
      resetForm();
    } catch (error) {
      console.error("Error operating on blog:", error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} the blog topic`);
    }
  };

  const handleEdit = (topic) => {
    setIsEditing(true);
    setEditTopic(topic);
    setNewTopic({ topic: topic.topic, order: topic.order });
  };

  const handleDelete = async (topicId) => {
    try {
      await deleteTopic({ variables: { id: topicId } });
      refetch();
      if (refetchTopics) refetchTopics();
      toast.success("Blog topic deleted successfully");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete the blog topic");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditTopic(null);
    setNewTopic({ topic: "", order: 0 });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter and sort topics
  const filteredTopics = data?.blogTopics
    ?.filter(topic => 
      topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => {
      if (sortOrder === "asc") return a.order - b.order;
      return b.order - a.order;
    }) || [];

  if (loading) return (
    <div className="fixed inset-0 bg-gray-800/80 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-800/80 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl mt-10 mb-10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Blog Topics Management</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search topics..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Order {sortOrder === "asc" ? <FiArrowDown /> : <FiArrowUp />}
            </button>
          </div>

          {/* Topics List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">All Blog Topics</h3>
            
            {filteredTopics.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {searchTerm ? "No topics match your search" : "No topics available"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {filteredTopics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">{topic.topic}</h4>
                      <p className="text-sm text-gray-500">Order: {topic.order}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit topic"
                      >
                        <FiEdit3 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(topic.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete topic"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isEditing ? "Edit Blog Topic" : "Add New Blog Topic"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={newTopic.topic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter topic name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={newTopic.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={16} />
                  {isEditing ? "Update Topic" : "Add Topic"}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-800 py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this topic? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogTopicModel;
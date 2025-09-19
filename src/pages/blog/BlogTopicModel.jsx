import React from 'react';
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { FiEdit3, FiTrash2 } from 'react-icons/fi';

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

const BlogTopicModel = ({ setShowModal, toast }) => {
  const [newBlog, setNewBlog] = React.useState({ topic: "", order: 0 });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editBlog, setEditBlog] = React.useState(null);

  const { loading, error, data, refetch } = useQuery(GET_TOPICS);
  const [createTopic] = useMutation(CREATE_TOPIC);
  const [updateTopic] = useMutation(UPDATE_TOPIC);
  const [deleteTopic] = useMutation(DELETE_TOPIC);

  React.useEffect(() => {
    if (error) {
      toast.error("Failed to fetch blog topics");
    }
  }, [error, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog((prevBlog) => ({
      ...prevBlog,
      [name]: name === "order" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTopic({
          variables: {
            id: editBlog.id,
            topic: newBlog.topic,
            order: newBlog.order
          }
        });
        toast.success("Blog topic updated successfully");
      } else {
        await createTopic({
          variables: {
            topic: newBlog.topic,
            order: newBlog.order
          }
        });
        toast.success("Blog topic added successfully");
      }
      
      refetch();
      setShowModal(false);
      setIsEditing(false);
      setNewBlog({ topic: "", order: 0 });
    } catch (error) {
      console.error("Error operating on blog:", error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} the blog`);
    }
  };

  const handleEdit = (topic) => {
    setIsEditing(true);
    setEditBlog(topic);
    setNewBlog({ topic: topic.topic, order: topic.order });
  };

  const handleDelete = async (topicId) => {
    try {
      await deleteTopic({ variables: { id: topicId } });
      refetch();
      toast.success("Blog topic deleted successfully");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete the blog");
    }
  };

  if (loading) return <div className="p-4">Loading topics...</div>;
  
  const topics = data?.blogTopics || [];

  return (
    <div className='overflow-y-auto '>
      <div className="fixed inset-0 top-6 bg-gray-800/50 flex justify-center items-center z-50 ">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <div className='mt-4 h-[300px] overflow-y-auto'>
            <h3 className="text-xl font-semibold mb-4">All Blog Topics</h3>
            {topics.length > 0 ? topics.map((topic) => (
              <div className="shadow-md m-3 p-2 flex justify-between border border-gray-200 items-center rounded-xl" key={topic.id}>
                <h1>{topic.topic}</h1>
                <div>
                  <button
                    onClick={() => handleEdit(topic)}
                    className="text-blue-600 m-1 hover:text-blue-800 cursor-pointer transition-all ease-in-out duration-150 border border-gray-200 p-2 rounded-md"
                  >
                    <FiEdit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer transition-all ease-in-out duration-150 border border-gray-200 p-2 rounded-md"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            )) :
              <h1 className="m-3 text-yellow-500">No Topics Available</h1>
            }
          </div>
          <h3 className="text-xl font-semibold mb-4">{isEditing ? "Edit Blog Topic" : "Add New Blog Topic"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="topic" className="block text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={newBlog.topic}
                onChange={handleInputChange}
                className="mt-2 w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="order" className="block text-gray-700">
                Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={newBlog.order}
                onChange={handleInputChange}
                className="mt-2 w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setNewBlog({ topic: "", order: 0 });
                }}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-700"
              >
                {isEditing ? "Update Blog Topic" : "Add Blog Topic"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogTopicModel;
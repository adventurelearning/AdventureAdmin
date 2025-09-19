import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import BlogTopicModel from "./BlogTopicModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

// GraphQL Queries and Mutations
const GET_BLOGS_ADMIN = gql`
  query GetBlogsAdmin($trending: Boolean, $topic: String) {
    blogPosts(trending: $trending, topic: $topic, status: "") {
      id
      title
      shortDescription
      photo
      status
      link
      topic
      likes
    }
  }
`;

const DELETE_BLOG = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id)
  }
`;

const UPDATE_BLOG_STATUS = gql`
  mutation UpdateBlogStatus($id: ID!, $status: String!) {
    updateBlogStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

function BlogTitle({ html }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      const container = ref.current;
      const elementsWithStyle = container.querySelectorAll('[style]');
      elementsWithStyle.forEach(el => {
        el.removeAttribute('style');
      });
    }
  }, [html]);

  return (
    <div
      className="text-sm "
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const BlogList = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch blogs using GraphQL query
  const { loading, error, data, refetch } = useQuery(GET_BLOGS_ADMIN);
  const [deleteBlog] = useMutation(DELETE_BLOG);
  const [updateBlogStatus] = useMutation(UPDATE_BLOG_STATUS);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch blogs");
    }
  }, [error]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog({ variables: { id } });
        refetch(); // Refetch the blogs after deletion
        toast.success("Blog deleted successfully");
      } catch (error) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const togglePublishStatus = async (blog) => {
    const newStatus = blog.status === "publish" ? "published" : "publish";
    try {
      await updateBlogStatus({ 
        variables: { 
          id: blog.id, 
          status: newStatus 
        } 
      });
      refetch(); // Refetch to get updated data
      toast.success(`Blog marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  function stripInlineStyles(html) {
    return html.replace(/style="[^"]*"/g, '');
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading blogs...</div>;
  
  const blogs = data?.blogPosts || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Manage your blog posts and publishing status
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all text-sm md:text-base"
            >
              <FiPlus className="text-lg" />
              Add Topic
            </button>
            <button
              onClick={() => navigate("add-blog")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all text-sm md:text-base"
            >
              <FiFileText className="text-lg" />
              New Blog Post
            </button>
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                  >
                    No blog posts found. Start by creating a new post.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-4 whitespace-wrap max-w-xs overflow-hidden text-sm font-medium text-gray-900">
                     <BlogTitle html={stripInlineStyles(blog.title)} />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-left text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {blog.status === "published" ? (
                          <>
                            <FiCheckCircle className="mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <FiXCircle className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center space-x-2 md:space-x-4">
                      <button
                        onClick={() => togglePublishStatus(blog)}
                        className={`px-3 py-1 rounded-md font-medium text-xs md:text-sm ${
                          blog.status === "published"
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {blog.status === "published" ? "Inactive" : "Publish"}
                      </button>
                      <button
                        onClick={() => navigate(`edit-blog/${blog.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit className="text-sm md:text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="text-sm md:text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {showModal && (
        <BlogTopicModel setShowModal={setShowModal} toast={toast} />
      )}
    </div>
  );
};

export default BlogList;
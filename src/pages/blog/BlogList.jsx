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
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiTrendingUp,
  FiGrid,
  FiList,
} from "react-icons/fi";

// GraphQL Queries and Mutations
const GET_BLOGS_ADMIN = gql`
  query GetBlogsAdmin($trending: Boolean, $topic: String) {
    blogPosts(trending: $trending, topic: $topic, status: "") {
      posts {
        id
        title
        shortDescription
        photo
        status
        link
        topic
        likes
        createdAt
        updatedAt
      }
      topics {
        id
        topic
      }
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
      className="text-sm font-medium text-gray-900 line-clamp-2"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const BlogList = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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
        refetch();
        toast.success("Blog deleted successfully");
      } catch (error) {
        toast.error("Failed to delete blog");
      }
    }
  };

  const togglePublishStatus = async (blog) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      await updateBlogStatus({ 
        variables: { 
          id: blog.id, 
          status: newStatus 
        } 
      });
      refetch();
      toast.success(`Blog ${newStatus === "published" ? "published" : "moved to draft"}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  function stripInlineStyles(html) {
    return html.replace(/style="[^"]*"/g, '');
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(Number(dateString));
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  // Filter and sort blogs
  const filteredBlogs = data?.blogPosts?.posts
    ?.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           blog.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
      const matchesTopic = topicFilter === "all" || blog.topic === topicFilter;
      
      return matchesSearch && matchesStatus && matchesTopic;
    })
    ?.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "popular") return b.likes - a.likes;
      return 0;
    }) || [];

  if (loading) return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const topics = data?.blogPosts?.topics || [];

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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blogs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FiFilter />
                Filters
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <FiList />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                  <FiGrid />
                </button>
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                >
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.topic}>{topic.topic}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            Showing {filteredBlogs.length} of {data?.blogPosts?.posts?.length} blog posts
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-blue-600 text-sm hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Blog Table (List View) */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 whitespace-nowrap text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FiFileText className="text-4xl text-gray-300 mb-2" />
                        <p className="text-lg">No blog posts found</p>
                        <p className="text-sm mt-1">
                          {searchTerm || statusFilter !== "all" || topicFilter !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "Start by creating a new post"}
                        </p>
                        {!(searchTerm || statusFilter !== "all" || topicFilter !== "all") && (
                          <button
                            onClick={() => navigate("add-blog")}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
                          >
                            Create Your First Post
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <>
                      <tr
                        key={blog.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === blog.id ? null : blog.id)}
                      >
                        <td className="px-4 py-4 whitespace-wrap max-w-xs text-sm font-medium text-gray-900">
                          <BlogTitle html={stripInlineStyles(blog.title)} />
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: stripInlineStyles(blog.shortDescription) }}></p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {blog.topic || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              blog.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
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
                                Draft
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(blog.updatedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center space-x-2 md:space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePublishStatus(blog);
                            }}
                            className={`px-3 py-1 rounded-md font-medium text-xs ${
                              blog.status === "published"
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {blog.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`edit-blog/${blog.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <FiEdit className="text-lg" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(blog.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </td>
                      </tr>
                      {expandedRow === blog.id && (
                        <tr className="bg-blue-50">
                          <td colSpan="5" className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Short Description</h4>
                                <p className="text-sm text-gray-600 mt-1">{blog.shortDescription}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Stats</h4>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <FiTrendingUp className="mr-1" />
                                  {blog.likes || 0} likes
                                </div>
                              </div>
                              <div className="flex items-center justify-start md:justify-end space-x-2">
                                <a 
                                  href={blog.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FiEye className="mr-1" />
                                  View Live
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-md">
                <FiFileText className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-lg text-gray-500">No blog posts found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || statusFilter !== "all" || topicFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Start by creating a new post"}
                </p>
              </div>
            ) : (
              filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {blog.photo && (
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img 
                        src={blog.photo} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {blog.topic || "Uncategorized"}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      <div dangerouslySetInnerHTML={{ __html: stripInlineStyles(blog.title) }} />
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: stripInlineStyles(blog.shortDescription) }}></p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <span>Updated: {formatDate(blog.updatedAt)}</span>
                      <div className="flex items-center">
                        <FiTrendingUp className="mr-1" />
                        {blog.likes || 0}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => togglePublishStatus(blog)}
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            blog.status === "published"
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {blog.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`edit-blog/${blog.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
        <BlogTopicModel setShowModal={setShowModal} toast={toast} refetchTopics={() => refetch()} />
      )}
    </div>
  );
};

export default BlogList;
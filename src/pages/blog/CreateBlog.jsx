import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "../../component/Editor";
import { ToastContainer, toast } from "react-toastify";
import { MdClose } from "react-icons/md";

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

const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: ID!) {
    blogPost(id: $id) {
      id
      title
      shortDescription
      description
      link
      topic
      subtitles {
        subtitle
        content
      }
      order
      trending
      photo
      status
      seo {
        metaTitle
        metaDescription
        keywords
        canonicalUrl
      }
    }
  }
`;

const CREATE_BLOG = gql`
  mutation CreateBlogPost($input: BlogInput!) {
    createBlogPost(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_BLOG = gql`
  mutation UpdateBlogPost($id: ID!, $input: BlogInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const CreateBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Existing state variables
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [subtitles, setSubtitles] = useState([{ subtitle: "", content: "" }]);
  const [order, setOrder] = useState(0);
  const [trending, setTrending] = useState(false);
  const [photo, setPhoto] = useState({ photo: "" });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // SEO state variables
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: ""
  });

  const { data: topicsData } = useQuery(GET_TOPICS);
  const { data: blogData, loading: blogLoading } = useQuery(GET_BLOG_BY_ID, {
    variables: { id },
    skip: !id
  });
  const [createBlog] = useMutation(CREATE_BLOG);
  const [updateBlog] = useMutation(UPDATE_BLOG);

  // Cloudinary configuration
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  // Set form data if we're editing an existing blog
  useEffect(() => {
    if (blogData?.blogPost) {
      const blog = blogData.blogPost;
      setTopic(blog.topic);
      setTitle(blog.title);
      setShortDescription(blog.shortDescription);
      setDescription(blog.description);
      setLink(blog.link);
      setSubtitles(blog.subtitles);
      setOrder(blog.order);
      setTrending(blog.trending);
      setPhoto({ photo: blog.photo });
      
      // Set SEO data if it exists
      if (blog.seo) {
        setSeo(blog.seo);
      }
    }
  }, [blogData]);

  // Handle SEO field changes
  const handleSeoChange = (field, value) => {
    setSeo(prevSeo => ({
      ...prevSeo,
      [field]: value
    }));
  };

  // Handle image upload to Cloudinary
  const uploadImage = async (file) => {
    setUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );
      
      const data = await response.json();
      console.log(data);
      
      setPhoto({ photo: data.secure_url });
      setUploading(false);
      toast.success("Image uploaded successfully!");
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  const handleInputChange = (index, field, value) => {
    setSubtitles((prevSubtitles) => {
      const updatedSubtitles = [...prevSubtitles];
      updatedSubtitles[index] = {
        ...updatedSubtitles[index],
        [field]: value,
      };
      return updatedSubtitles;
    });
  };
  
  const handleInputChange2 = (e) => {
    setTopic(e.target.value);
  };

  const addSubtitleContent = () => {
    setSubtitles((prev) => [...prev, { subtitle: "", content: "" }]);
  };

  const removeSubtitleContent = (index) => {
    const updatedSubtitles = subtitles.filter((_, i) => i !== index);
    setSubtitles(updatedSubtitles);
  };
// Utility to clean Apollo objects before sending them back
const removeTypename = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      if (key !== "__typename") {
        newObj[key] = removeTypename(obj[key]);
      }
    });
    return newObj;
  }
  return obj;
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const blogData = {
      title,
      shortDescription,
      description,
      link,
      subtitles,
      order: parseInt(order),
      trending,
      photo: photo.photo,
      topic,
      seo // Include SEO data in submission
    };
console.log(blogData);
    const cleanedInput = removeTypename(blogData); // 👈 strip __typename

    try {
      if (id) {
        await updateBlog({
          variables: {
            id,
            input: cleanedInput
          }
        });
        toast.success("Blog updated successfully!");
      } else {
        await createBlog({
          variables: {
            input: blogData
          }
        });
        toast.success("Blog created successfully!");
      }

      setTimeout(() => {
        navigate("/blog");
      }, 2000);
    } catch (error) {
      console.error("Error submitting blog:", error);
      toast.error(error.message || "Failed to submit the blog");
    }
  };

  if (blogLoading) return <div className="flex justify-center items-center h-64">Loading blog data...</div>;

  const AllTopics = topicsData?.blogTopics || [];

  return (
    <div className="container mx-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <p></p>
        <h2 className="text-3xl font-semibold text-center">
          {id ? "Update Blog" : "Create New Blog"}
        </h2>

        <button
          onClick={() => navigate("/blog")}
          className=" p-2 flex items-center text-black rounded-full hover:bg-transparent focus:outline-none duration-200"
        >
          <span className="transition-transform transform hover:rotate-180 duration-300">
            <MdClose size={24} />
          </span>
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Topic
        </label>
        <select
          name="topic"
          value={topic}
          required
          onChange={handleInputChange2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>
            Select
          </option>
          {AllTopics.map((item) => (
            <option key={item.id} value={item.topic}>
              {item.topic}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Title
        </label>
        <Editor value={title} onChange={(value) => setTitle(value)} />
      </div>
      
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-5">
          Banner Image
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                uploadImage(file);
              }
            }}
            className="hidden"
            id="image-upload"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">Uploading: {progress}%</p>
            </div>
          ) : (
            <>
              <label htmlFor="image-upload" className="cursor-pointer">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-gray-600">
                  <span className="relative rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    Upload an image
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </>
          )}
        </div>
        
        {photo.photo && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
            <div className="relative inline-block">
              <img
                src={photo.photo}
                alt="Uploaded preview"
                className="h-40 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => setPhoto({ photo: "" })}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
              >
                <MdClose size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Short Description
        </label>
        <Editor
          value={shortDescription}
          onChange={(e) => setShortDescription(e)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Description
        </label>
        <Editor
          value={description}
          onChange={(e) => setDescription(e)}
          className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          rows="6"
          placeholder="Enter full description"
          required
        />
      </div>

      <div className="flex flex-wrap justify-between gap-4 my-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-auto">
          <label className="block text-lg font-medium text-gray-700 mb-3 sm:mb-0">
            Link :
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-2 sm:mt-0 p-2 w-full sm:w-96 border border-gray-300 rounded-md"
            placeholder="Enter a link (e.g., related resource or URL)"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-auto">
          <label className="block text-lg font-medium text-gray-700 mb-3 sm:mb-0">
            Order :
          </label>
          <input
            type="text"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="mt-2 sm:mt-0 p-2 w-full sm:w-96 border border-gray-300 rounded-md"
            placeholder="Enter order number"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 my-4">
        <input
          type="checkbox"
          checked={trending}
          onChange={() => setTrending(!trending)}
          className="h-5 w-5 text-blue-500"
        />
        <label className="text-lg font-medium text-gray-700">
          Mark as Trending
        </label>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Subtitles & Content
        </label>
        {subtitles?.map((item, index) => (
          <div key={index} className="space-y-2 mb-4">
            <label
              htmlFor=""
              className="block text-md font-medium text-gray-700 mb-3"
            >
              Sub title-{index + 1}
            </label>
            <Editor
              value={item.subtitle}
              onChange={(e) => handleInputChange(index, "subtitle", e)}
              required
            />

            <label
              htmlFor=""
              className="block text-md font-medium text-gray-700 mb-3"
            >
              Content
            </label>

            <Editor
              value={item.content}
              onChange={(e) => handleInputChange(index, "content", e)}
              required
            />

            {subtitles.length > 1 && (
              <button
                type="button"
                onClick={() => removeSubtitleContent(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSubtitleContent}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Add Subtitle and Content
        </button>
      </div>

      {/* SEO Fields Section */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">SEO Settings</h3>
        
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Meta Title
          </label>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter meta title for SEO (50-60 characters)"
            maxLength={60}
          />
          <p className="text-sm text-gray-500 mt-1">
            {seo.metaTitle.length}/60 characters
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Meta Description
          </label>
          <textarea
            value={seo.metaDescription}
            onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter meta description for SEO (150-160 characters)"
            maxLength={160}
          />
          <p className="text-sm text-gray-500 mt-1">
            {seo.metaDescription.length}/160 characters
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Keywords
          </label>
          <input
            type="text"
            value={seo.keywords}
            onChange={(e) => handleSeoChange("keywords", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter comma-separated keywords"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Canonical URL
          </label>
          <input
            type="url"
            value={seo.canonicalUrl}
            onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter canonical URL for this page"
          />
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          {id ? "Update Blog" : "Create Blog"}
        </button>
      </div>
    </div>
  );
};

export default CreateBlog;
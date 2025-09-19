import React, { useEffect, useRef, memo,useState } from "react";

const Editor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const [tinymceLoaded, setTinymceLoaded] = useState(false);

  useEffect(() => {
    if (window.tinymce && editorRef.current) {
      window.tinymce.init({
        target: editorRef.current,
        height: 100,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
          "textcolor",
          "image",
        ],
        toolbar:
          "undo redo | formatselect | bold italic backcolor | fontselect | fontsizeselect | forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lineheight | link image | code",
        setup: (editor) => {
          // Setup event listener for content changes
          editor.on("Change", () => {
            onChange(editor.getContent());
          });

          // Add line height button (compatible with older versions)
          if (editor.addButton) {
            // TinyMCE 4.x
            editor.addButton("lineheight", {
              type: "menubutton",
              text: "Line Height",
              icon: false,
              menu: [
                { text: "1.0", onclick: () => setLineHeight(editor, "1") },
                { text: "1.2", onclick: () => setLineHeight(editor, "1.2") },
                { text: "1.5", onclick: () => setLineHeight(editor, "1.5") },
                { text: "2.0", onclick: () => setLineHeight(editor, "2") },
                { text: "Reset", onclick: () => resetLineHeight(editor) },
              ],
            });
          } else {
            // Fallback for very old versions
            editor.addCommand("lineheight", () => {
              editor.windowManager.alert(
                "Line height requires TinyMCE 4.x or newer"
              );
            });
          }

          // Helper function to set line height
          function setLineHeight(editor, value) {
            editor.dom.setStyle(
              editor.selection.getNode(),
              "lineHeight",
              value
            );
          }

          // Helper function to reset line height
          function resetLineHeight(editor) {
            editor.dom.setStyle(editor.selection.getNode(), "lineHeight", "");
          }
        },
        content_style: `
          body { line-height: 1.4; }
          * { line-height: inherit; }
        `,
        images_upload_url: `${
          import.meta.env.VITE_IMAGE_UPLOAD_URL
        }/api/uploads/images`,
        images_upload_handler: (blobInfo, success, failure) => {
          let formData = new FormData();
          formData.append("file", blobInfo.blob(), blobInfo.filename());

          fetch(`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/api/uploads/images`, {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              if (!response.ok) {
                return Promise.reject(
                  `Server responded with status: ${response.status}`
                );
              }
              return response.json();
            })
            .then((data) => {
              if (data.location) {
                success(data.location);
              } else {
                failure("Server returned invalid data (no location)");
              }
            })
            .catch((error) => {
              console.error("Error uploading image:", error);
              failure("Error uploading image: " + error);
            });
        },
      });

      return () => {
        if (window.tinymce && editorRef.current) {
          window.tinymce.remove(editorRef.current);
        }
      };
    }
  }, [onChange]);

  useEffect(() => {
    if (window.tinymce && editorRef.current) {
      const editor = window.tinymce.get(editorRef.current.id);
      if (editor) {
        editor.setContent(value || "");
      }
    }
  }, [value]);

  return (
    <div>
      <div ref={editorRef}></div>
    </div>
  );
};

export default memo(Editor);

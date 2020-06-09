import React from "react";
import { useDropzone } from "react-dropzone";

const allowedExt = ["jpg", "png", "gif", "jpeg"];

export default function MyDropzone(props: { files: Array<any> }) {
  props.files.length = 0;
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const files = acceptedFiles.map((file: any) => {
    let pos = file.name.lastIndexOf(".");
    let ext = file.name.slice(pos + 1);
    if (pos === -1 || !allowedExt.includes(ext.toLowerCase())) return null;

    props.files.push(file);
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    );
  });

  return (
    <section className="container">
      <h4>Fotografie nemovitosti</h4>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Sem přetáhněte soubory nebo klikněte a vyberte z disku</p>
      </div>
      <aside>
        <ul>{files}</ul>
      </aside>
    </section>
  );
}

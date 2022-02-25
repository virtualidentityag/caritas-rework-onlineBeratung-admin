import { message, Form, Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import getBase64 from "../../utils/getBase64";
import { UploadFileProps } from "../../types/uploadFiles";

const { Item } = Form;

function FileUploader1({
  name,
  label,
  getValueFromEvent,
  imageUrl,
  setImageUrl,
}: {
  name: string;
  label: string;
  getValueFromEvent: (e: any) => void;
  imageUrl: string | "";
  setImageUrl: any;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: UploadFileProps) => {
    console.log("beforeupload", file);
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      (name === "favicon" && file.type === "image/x-icon");
    if (!isJpgOrPng) {
      message.error(t("message.error.upload.filetype"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t("message.error.upload.filesize"));
    }

    getBase64(file, (imgUrl: string | ArrayBuffer | null) => {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setImageUrl(imgUrl);
    });

    return false;
    // return isJpgOrPng && isLt2M;
  };

  return (
    <Item
      label={label}
      getValueFromEvent={getValueFromEvent}
      name="logo"
      className="block"
    >
      <Upload
        name="upload"
        listType="picture-card"
        className="fileUploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>{t("btn.upload")}</div>
          </div>
        )}
      </Upload>
    </Item>
  );
}

export default FileUploader1;

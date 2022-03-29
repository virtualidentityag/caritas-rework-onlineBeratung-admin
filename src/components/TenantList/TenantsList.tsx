import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import moment from "moment";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Title from "antd/es/typography/Title";
import { TenantData } from "../../types/tenant";
import getFakeMultipleTenants from "../../api/tenant/getFakeMultipleTenants";
import EditableTable from "../EditableTable/EditableTable";
import ModalForm from "../Counselor/ModalForm";
import { defaultCounselor } from "../Counselor/Counselor";

function TenantsList() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getFakeMultipleTenants()
      .then((result: any) => {
        setIsLoading(false);
        setTenants(result);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [t]);

  const columns: any[] = [
    {
      title: t("organisation.title"),
      dataIndex: "name",
      key: "name",
      sorter: (a: TenantData, b: TenantData) => a.name.localeCompare(b.name),
      width: 150,
      ellipsis: true,
      fixed: "left",
    },
    {
      width: 250,
      title: t("organisation.subdomain"),
      dataIndex: "subdomain",
      ellipsis: true,
      key: "subdomain",
      /* sorter: (a: TenantData, b: TenantData) =>
        a.subdomain.localeCompare(b.subdomain), */
    },
    {
      title: t("createDate"),
      dataIndex: "createDate",
      key: "createDate",
      ellipsis: true,
      width: 150,
      sorter: (a: TenantData, b: TenantData) =>
        moment(a.createDate).unix() - moment(b.createDate).unix(),
      render: (date: Date) => {
        return <span> {date.toLocaleDateString("de-DE")}</span>;
      },
    },
    {
      title: t("organisation.allowedNumberOfUsers"),
      width: 150,
      ellipsis: true,
      render: (record: { licensing: { allowedNumberOfUsers: number } }) =>
        record.licensing.allowedNumberOfUsers,
      /* sorter: (a: TenantData, b: TenantData) =>
        a.licensing.allowedNumberOfUsers - b.licensing.allowedNumberOfUsers, */
    },
  ];

  return (
    <>
      <Title level={3}>{t("organisations.title")}</Title>
      <p>{t("organisations.title.text")}</p>
      <EditableTable
        handleBtnAdd={() => {} /* handleCreateModal */}
        source={tenants}
        isLoading={isLoading}
        columns={columns}
        handleDeleteModalTitle={t("counselor.modal.headline.delete")}
        handleDeleteModalCancel={() => {} /* handleDeleteModal */}
        handleDeleteModalText={t("counselor.modal.delete.text")}
        handleOnDelete={() => {} /* handleOnDelete */}
        isDeleteModalVisible
        handlePagination={() => {} /* setPage */}
        page={1 /* page */}
      />
    </>
  );
}

export default TenantsList;

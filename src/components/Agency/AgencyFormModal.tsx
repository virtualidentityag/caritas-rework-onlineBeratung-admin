import { useEffect, useState } from "react";
import { Form, Input, message, Modal, Switch, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import Title from "antd/es/typography/Title";
import { AgencyData } from "../../types/agency";
import getAgencyPostCodeRange, {
  PostCodeRange,
} from "../../api/agency/getAgencyPostCodeRange";
import PostCodeRanges from "./PostCodeRanges";
import addAgencyData from "../../api/agency/addAgencyData";
import pubsub, { PubSubEvents } from "../../state/pubsub/PubSub";
import updateAgencyData from "../../api/agency/updateAgencyData";
import hasAgencyConsultants from "../../api/agency/hasAgencyConsultants";
import getTopicByTenantData from "../../api/topic/getTopicByTenantData";
import { useUserRoles } from "../../hooks/useUserRoles.hook";
import { UserRole } from "../../enums/UserRole";
import { convertToOptions } from "../../utils/convertToOptions";
import { SelectFormField } from "../SelectFormField";
import { SliderFormField } from "../SliderFormField";
import { Gender } from "../../enums/Gender";
import { FeatureFlag } from "../../enums/FeatureFlag";
import { useFeatureContext } from "../../context/FeatureContext";

const { TextArea } = Input;
const { Item } = Form;
const { Paragraph } = Typography;
const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 100;

function hasOnlyDefaultRangeDefined(data: PostCodeRange[]) {
  return (
    data.length === 1 && data[0].from === "00000" && data[0].until === "99999"
  );
}

function AgencyFormModal() {
  const { t } = useTranslation();
  const { isEnabled } = useFeatureContext();
  const [agencyModel, setAgencyModel] = useState<AgencyData | undefined>(
    undefined
  );
  const [formInstance] = Form.useForm();
  const [postCodeRangesSwitchActive, setPostCodeRangesSwitchActive] =
    useState(false);
  const [onlineSwitchDisabled, setOnlineSwitchDisabled] = useState(true);
  const [agencyPostCodeRanges, setAgencyPostCodeRanges] = useState(
    [] as PostCodeRange[]
  );
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [allActiveTopics, setAllActiveTopics] = useState<Record<string, any>[]>(
    []
  );

  const [, hasRole] = useUserRoles();

  useEffect(() => {
    pubsub.subscribe(PubSubEvents.AGENCY_UPDATE, (data) => {
      setAgencyModel({ ...data });
      setIsModalVisible(true);
      formInstance.setFieldsValue(data);
      if (data) {
        setSubmitButtonDisabled(data.id == null);
      }
    });
  }, []);

  const setPostCodeRangesSwitchState = (data: PostCodeRange[]) => {
    if (hasOnlyDefaultRangeDefined(data)) {
      setPostCodeRangesSwitchActive(false);
      formInstance.setFieldsValue({ postCodeRangesActive: false });
    } else {
      setPostCodeRangesSwitchActive(true);
      formInstance.setFieldsValue({ postCodeRangesActive: true });
    }
  };

  const agencyId = agencyModel && agencyModel.id;

  useEffect(() => {
    formInstance.resetFields();
    if (agencyId != null) {
      Promise.all([
        hasAgencyConsultants(agencyId),
        getAgencyPostCodeRange(agencyId),
      ]).then((values) => {
        const hasAgencyConsultantsResponse = values[0];
        setOnlineSwitchDisabled(!hasAgencyConsultantsResponse);
        const agencyPostCodeRangesResponse = values[1];
        setAgencyPostCodeRanges(agencyPostCodeRangesResponse);
        setPostCodeRangesSwitchState(agencyPostCodeRangesResponse);
      });
    }
  }, [t, agencyId, formInstance]);

  const handleAddAction = (formData: Record<string, any>) => {
    setIsModalVisible(false);
    if (agencyModel && agencyModel.id != null) {
      updateAgencyData(agencyModel, formData as AgencyData).then(() => {
        message.success({
          content: t("message.agency.update"),
          duration: 3,
        });
        pubsub.publishEvent(PubSubEvents.AGENCYLIST_UPDATE, undefined);
      });
    } else {
      addAgencyData(formData).then(() => {
        message.success({
          content: t("message.agency.add"),
          duration: 3,
        });
        pubsub.publishEvent(PubSubEvents.AGENCYLIST_UPDATE, undefined);
      });
    }
  };

  const onFinishFailed = () => {
    message.error({
      content: t("message.error.default"),
      duration: 3,
    });
  };

  const onFieldsChange = () => {
    setSubmitButtonDisabled(
      Object.values(
        formInstance.getFieldsValue(["name", "city", "postcode"])
      ).some((field: any) => field.length === 0) ||
        formInstance
          .getFieldsError()
          .some((field: any) => field.errors.length > 0)
    );
  };

  useEffect(() => {
    setIsLoading(true);
    getTopicByTenantData()
      .then((result: any) => {
        formInstance.setFieldsValue({ topic: result[0].id });
        const activeTopics = result.filter((topic) => {
          return topic.status === "ACTIVE";
        });
        setAllActiveTopics(activeTopics);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setAllActiveTopics([]);
      });
  }, [t, formInstance]);

  if (agencyModel === undefined) {
    return <div />;
  }

  const { online } = agencyModel;
  const demographicsInitialValues = isEnabled(FeatureFlag.Demographics)
    ? {
        demographics: {
          age: agencyModel?.demographics?.ageFrom
            ? [agencyModel.demographics.ageFrom, agencyModel.demographics.ageTo]
            : [DEFAULT_MIN_AGE, DEFAULT_MAX_AGE],
          genders:
            agencyModel?.id != null
              ? agencyModel?.demographics?.genders
              : Object.values(Gender),
        },
      }
    : {};
  return (
    <Modal
      destroyOnClose
      title={
        <>
          <Title level={2}>
            {agencyModel.id != null
              ? t("agency.modal.headline.edit")
              : t("agency.modal.headline.add")}
          </Title>
          <small className="requiredFieldsInfo">{t("required.info")}</small>
        </>
      }
      visible={isModalVisible}
      onOk={() => {
        formInstance.validateFields().then((values) => {
          handleAddAction(values);
          setOnlineSwitchDisabled(true);
          setIsModalVisible(false);
          setAgencyModel(undefined);
          setAgencyPostCodeRanges([]);
          setPostCodeRangesSwitchActive(false);
          formInstance.resetFields();
        });
      }}
      onCancel={() => {
        setOnlineSwitchDisabled(true);
        setIsModalVisible(false);
        setAgencyModel(undefined);
        setAgencyPostCodeRanges([]);
        setPostCodeRangesSwitchActive(false);
        formInstance.resetFields();
      }}
      okButtonProps={{
        disabled: submitButtonDisabled,
      }}
      okText={t("btn.ok.uppercase")}
    >
      <Form
        form={formInstance}
        onFinishFailed={onFinishFailed}
        onFieldsChange={onFieldsChange}
        size="small"
        labelAlign="left"
        labelWrap
        layout="vertical"
        initialValues={{
          ...agencyModel,
          ...demographicsInitialValues,
          topicIds: convertToOptions(agencyModel.topics, "name", "id"),
          postCodeRangesActive: postCodeRangesSwitchActive,
          online,
        }}
      >
        <Item label={t("agency.name")} name="name" rules={[{ required: true }]}>
          <Input placeholder={t("placeholder.agency.name")} maxLength={100} />
        </Item>
        <Item
          label={t("agency.description")}
          name="description"
          rules={[{ required: false }]}
        >
          <TextArea placeholder={t("placeholder.agency.description")} />
        </Item>
        {onlineSwitchDisabled && (
          <Item name="online">
            <Tooltip title={t("agency.online.tooltip")}>
              <div className="flex">
                <Switch
                  size="default"
                  disabled={onlineSwitchDisabled}
                  defaultChecked={online}
                  onChange={(value) => {
                    formInstance.setFieldsValue({ online: value });
                  }}
                />
                <Paragraph className="desc__toggleText">
                  {t("agency.online")}
                </Paragraph>
              </div>
            </Tooltip>
          </Item>
        )}
        {!onlineSwitchDisabled && (
          <Item name="online">
            <div className="flex">
              <Switch
                size="default"
                disabled={onlineSwitchDisabled}
                defaultChecked={online}
                onChange={(value) => {
                  formInstance.setFieldsValue({ online: value });
                }}
              />
              <Paragraph className="desc__toggleText">
                {t("agency.online")}
              </Paragraph>
            </div>
          </Item>
        )}
        <SelectFormField
          label="agency.teamAgency"
          name="teamAgency"
          placeholder="plsSelect"
          options={[
            { value: "true", label: t("yes") },
            { value: "false", label: t("no") },
          ]}
        />
        {isEnabled(FeatureFlag.Demographics) && (
          <>
            <SliderFormField
              label={t("agency.age")}
              name={["demographics", "age"]}
              min={0}
              max={100}
            />
            <SelectFormField
              label="agency.gender"
              name={["demographics", "genders"]}
              isMulti
              options={Object.values(Gender).map((gender) => ({
                value: gender,
                label: t(`agency.gender.option.${gender.toLowerCase()}`),
              }))}
            />
          </>
        )}
        {hasRole(UserRole.TopicAdmin) &&
          isEnabled(FeatureFlag.Topics) &&
          allActiveTopics?.length > 0 && (
            <SelectFormField
              label="topics.title"
              name="topicIds"
              isMulti
              loading={isLoading}
              allowClear
              placeholder="plsSelect"
              options={convertToOptions(allActiveTopics, "name", "id")}
            />
          )}
        <Item label={t("agency.city")} name="city" rules={[{ required: true }]}>
          <Input placeholder={t("placeholder.agency.city")} maxLength={100} />
        </Item>
        <Item
          label={t("agency.postcode")}
          name="postcode"
          rules={[{ required: true }]}
        >
          <Input placeholder={t("placeholder.agency.postcode")} maxLength={5} />
        </Item>
        <Item name="postCodeRangesActive">
          <div className="flex">
            <Switch
              size="default"
              checked={postCodeRangesSwitchActive}
              onChange={() => {
                const switchValue = !postCodeRangesSwitchActive;
                setPostCodeRangesSwitchActive(switchValue);
                formInstance.setFieldsValue({
                  postCodeRangesActive: switchValue,
                });
              }}
            />
            <Paragraph className="desc__toggleText">
              {t("agency.postCodeRanges")}
            </Paragraph>
          </div>
        </Item>
        {postCodeRangesSwitchActive && (
          <PostCodeRanges
            agencyPostCodeRanges={agencyPostCodeRanges}
            formInputData={formInstance}
          />
        )}
      </Form>
    </Modal>
  );
}

export default AgencyFormModal;

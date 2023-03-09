import { memo, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query';
import { BaseUserPlan, UserPlan } from './types'

import { Alert, Button, Form, Modal, Table, Tag, message, Divider } from 'antd';
import { GeneratedUserForm } from './GeneratedUserForm';
import { FormSubmit } from './User';
import dayjs from 'dayjs';

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

const { Column } = Table;

const updateUser = async ({ userId, user }: { userId: string, user: BaseUserPlan }) => {
  const response = await fetch(`/updateUser/${userId}`, {
    method: "PUT",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });


  const userResponse: UserPlan = await response.json();

  return {
    ...userResponse,
    startDate: new Date(userResponse.startDate),
    endDate: new Date(userResponse.endDate),
  };
};

const deleteUser = async ({ userId, user }: { userId: string, user: BaseUserPlan }) => {
  const response = await fetch(`/deleteUser/${userId}`, {
    method: "PUT",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });


  const userResponse: UserPlan = await response.json();

  return {
    ...userResponse,
    startDate: new Date(userResponse.startDate),
    endDate: new Date(userResponse.endDate),
  };
};

const displayUserType = (userGender: "generic" | "holiday") => {
  switch (userGender) {
    case "generic":
      return <Tag color="purple">Generic</Tag>;
    case "holiday":
      return <Tag color="red">Holiday</Tag>;
  }
};

function displayDate(date: string) {
  const userDate = new Date(date);
  return <span>{new Intl.DateTimeFormat().format(userDate)}</span>;
}

interface UserTableProps {
  data?: BaseUserPlan[];
  isFetching?: boolean;
  error?: unknown;
}
const UserTable = memo(
  function UserTable(props: UserTableProps) {
    const { data, isFetching, error } = props;

    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFailForm, setIsFailForm] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserPlan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const editMutation = useMutation(updateUser, {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    });
    const delelteMutation = useMutation(deleteUser, {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    });

    const showModal = (user: UserPlan) => {
      setIsModalOpen(true);
      setCurrentUser(user);
    };

    const handleOk = () => {
      setIsModalOpen(false);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      setIsFailForm(false)
      form.resetFields()
    };

    const success = (messsageTitle: string) => {
      messageApi.open({
        type: 'success',
        content: messsageTitle,
      });
    };


    useEffect(() => {
      if (currentUser) {
        form.setFieldsValue({
          title: currentUser.title,
          type: currentUser.type,
          description: currentUser.description,
          startDateendDate: [dayjs(currentUser.startDate, DATE_FORMAT), dayjs(currentUser.endDate, DATE_FORMAT)]
        });
      }
    });

    const handleSubmit = async (values: FormSubmit) => {
      setIsSubmitting(true);
      const type = values?.type ? values.type : "generic"
      const startDate = values?.startDate?.endDate ? new Intl.DateTimeFormat().format(values.startDate.endDate[0]).toString() : new Date().toString()
      const endDate = values?.startDate?.endDate ? new Intl.DateTimeFormat().format(values.startDate.endDate[1]).toString() : new Date().toString()
      const description = values?.description ? values.description : ""
      const userRequest = {
        ...values,
        type,
        startDate,
        endDate,
        description
      };
      // Perform the API request to create the user
      try {
        editMutation.mutateAsync({ userId: currentUser!.id, user: userRequest });
        setIsSubmitting(false);
        setIsFailForm(false)
        form.resetFields()
        setIsModalOpen(false);
        success(`${values.title} User successfully edited`)
      } catch (error) {
        setIsSubmitting(false);
      }

    }

    const onFinishFailed = () => {
      setIsFailForm(true)
    };

    const onRemoveUser = async (user: UserPlan) => {
      try {
        delelteMutation.mutateAsync({ userId: user.id, user: user });
        success(`${user.title} User successfully deleted`)
      } catch (error) {
        console.log("error during deletion", error)
      }
    }

    if (error) {
      return <div>{`Error: ${error}`}</div>
    }
    return (
      <>
        {contextHolder}

        <Table id="user-table" dataSource={data} loading={isFetching} rowKey="id">
          <Column title="Title" dataIndex="title"></Column>
          <Column title="Type" dataIndex="type" render={displayUserType}></Column>
          <Column
            title="Start Date"
            dataIndex="startDate"
            render={displayDate}
          ></Column>
          <Column title="End Date" dataIndex="endDate" render={displayDate}></Column>
          <Column title="Description" dataIndex="description" />
          <Column
            title="Action"
            key="action"
            render={(text, user: UserPlan) => (
              <div className="dropdown">
                <button className="dropdown-toggle">
                  More actions
                  <i className="arrow-down"></i>
                </button>
                <div className="dropdown-menu">
                  <a href="/" onClick={(e) => {
                    e.preventDefault()
                    showModal(user)
                  }}>Edit</a>
                  <a href="/" onClick={(e) => {
                    e.preventDefault()
                    onRemoveUser(user)
                  }}>Delete</a>
                </div>
              </div>

            )}
          />
        </Table>

        <Modal
          title={"Edit User"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose={true}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" loading={isSubmitting} onClick={form.submit} disabled={isSubmitting}>
              Save
            </Button>,
          ]}
        >

          <Form form={form} onFinish={handleSubmit} onFinishFailed={onFinishFailed} layout={"vertical"}
          >
            <Divider />
            <GeneratedUserForm />
          </Form>
          {isFailForm && <Alert message="There are errors in the form. Please correct before saving." type="error" showIcon />}

        </Modal>
      </>
    )
  })

export { UserTable }
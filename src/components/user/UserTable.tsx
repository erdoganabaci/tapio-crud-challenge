import { memo, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query';
import { BaseUserPlan, UserPlan } from './types'

import { Alert, Button, Form, Modal, Table, message, Divider } from 'antd';
import { GeneratedUserForm } from './GeneratedUserForm';
import { FormSubmit } from './User';


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
  return userResponse
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
  return userResponse
};



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
          user: currentUser.user,
          title: currentUser.title,
          description: currentUser.description,
        });
      }
    });

    const handleSubmit = async (values: FormSubmit) => {
      setIsSubmitting(true);
      const description = values?.description ? values.description : ""
      const userRequest = {
        ...values,
        description
      };
      // Perform the API request to create the user
      try {
        editMutation.mutateAsync({ userId: currentUser!.id, user: userRequest });
        setIsSubmitting(false);
        setIsFailForm(false)
        form.resetFields()
        setIsModalOpen(false);
        success(`${values.user} User successfully edited`)
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
          <Column title="User" dataIndex="user"></Column>
          <Column title="Title" dataIndex="title"></Column>
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
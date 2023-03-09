import { Button, Divider, Input, Modal, Form, message, Alert } from 'antd';
import { memo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UserTable } from './UserTable';
import { GeneratedUserForm } from "./GeneratedUserForm"
import { BaseUserPlan, UserPlan } from './types';

const { Search } = Input;

export interface FormSubmit {
  user: string;
  title: string;
  description?: string;
}

const fetchUsers = async ({ queryKey }: any) => {
  const [, searchTerm] = queryKey;
  const response = await fetch(`/users/search?q=${(searchTerm as string).toLowerCase()}`);
  const data: UserPlan[] = await response.json();
  return data;
};

const createUser = async (user: BaseUserPlan) => {
  const response = await fetch("/createUser", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    }
  }
  );

  const userResponse: UserPlan = await response.json();
  return userResponse;

};

const User = memo(
  function User() {
    const queryClient = useQueryClient();
    const [isFailForm, setIsFailForm] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const mutation = useMutation(createUser, {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    });

    const { data: dataUsers, isFetching: isFetchingUsers, error: errorUsers } = useQuery(["users", searchTerm], fetchUsers);

    const handleSearch = () => {
      setSearchTerm("");
    };


    const showModal = () => {
      setIsModalOpen(true);
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

    const handleSubmit = async (values: FormSubmit) => {
      setIsSubmitting(true);
      const description = values?.description ? values.description : ""

      const userRequest = {
        ...values,
        description
      };
      // Perform the API request to create the user
      try {
        await mutation.mutateAsync(userRequest);
        setIsSubmitting(false);
        setIsFailForm(false)
        form.resetFields()
        setIsModalOpen(false);
        success(`${values.title} User successfully created`)
      } catch (error) {
        setIsSubmitting(false);
      }

    }

    const onFinishFailed = () => {
      setIsFailForm(true)
    };
    return (
      <>
        {contextHolder}

        <div className="header">
          <Search
            placeholder="Search posts"
            enterButton="Clean"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: "30%" }}
          />
          <Button id="create-user" type="primary" className="button" onClick={showModal}>Create Post</Button>
        </div>
        <div className="table-container">
          <UserTable data={dataUsers} isFetching={isFetchingUsers} error={errorUsers} />

          <Modal title="Create new post" open={isModalOpen} onOk={form.submit} okText={"Save"} onCancel={handleCancel}

            footer={[
              <Button key="back" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button id="save-button" key="submit" type="primary" loading={isSubmitting} onClick={form.submit} disabled={isSubmitting}>
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
        </div>

      </>
    )
  })

export { User }
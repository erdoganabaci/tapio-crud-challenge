import { Spin } from "antd";
import { memo } from "react";
import { useQuery } from "react-query";
import { UserForm } from "../atoms/form/UserForm";
import { RangePickerForm, SelectForm, TextAreaForm, TextForm } from "../atoms/form/types";

interface QueryFormSchemaResult {
    data?: (TextForm | SelectForm | RangePickerForm | TextAreaForm)[];
    isFetching: boolean;
    error?: null;
}

const fetchFormSchema = async () => {
    const response = await fetch("/userFormSchema");
    const data = await response.json();
    return data;
};
const GeneratedUserForm = memo(function GeneratedUserForm
    () {
    const { data: dataFormSchema, isFetching: isFetchingFormSchema }: QueryFormSchemaResult = useQuery("userFormSchema", fetchFormSchema);

    return (
        <div>
            {!isFetchingFormSchema ? (dataFormSchema!).map((shema, i) => {
                return <UserForm key={i} schema={shema} />
            }) : <Spin size="small" tip="Loading..." />}
        </div>
    );
}
);

export { GeneratedUserForm };


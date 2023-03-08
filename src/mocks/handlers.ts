import { rest } from "msw";
import { faker } from "@faker-js/faker";
import { RangePickerForm, SelectForm, TextAreaForm, TextForm } from "../components/atoms/form/types";
import dayjs from "dayjs";

const formSchema: (TextForm | SelectForm | RangePickerForm | TextAreaForm)[] = [
  {
    name: "title",
    label: "Title",
    component: "text",
    required: true,
  },
  {
    name: "type",
    component: "select",
    label: "Type",
    options: [
      {
        label: "Generic",
        value: "generic",
      },
      {
        label: "Holiday",
        value: "holiday",
      },
    ],
  },
  {
    name: ["startDate", "endDate"],
    // name: "startDateEndDate", // auto generate name from array in Range Picker component
    component: "range_picker",
    label: "Date",
  },
  {
    name: "description",
    label: "Description",
    component: "textarea",
  },
];

let users = Array(12).fill(0).map((_, i) => {
  const endDate = faker.date.between(new Date(), faker.date.future());
  const daysDiff = dayjs(endDate).diff(new Date(), 'day');
  const randomDaysToAdd = Math.floor(Math.random() * daysDiff);
  const startDate = dayjs(endDate).subtract(randomDaysToAdd, 'day').toDate();
  
  return {
    id: i.toString(),
    title: faker.lorem.words(),
    type: faker.helpers.arrayElement(["generic", "holiday"]),
    startDate: startDate,
    endDate: endDate,
    description: faker.lorem.words(),
  }
});
export const handlers = [

  rest.get("/userFormSchema", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body(JSON.stringify(formSchema)),
      ctx.delay(2000)
    );
  }),

  rest.get("/users", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body(JSON.stringify(users)),
      ctx.delay(1000)
    );
  }),

  rest.post("/user", async (req, res, ctx) => {    
    const user = { id: users.length.toString(), ...(await req.json()) };
    // last user will be displayed first
    users = [user, ...users];

    return res(
      ctx.status(200),
      ctx.body(JSON.stringify(user)), // send back the created user
      ctx.delay(1000)
    );
  }),
  // update user and display it first
  rest.put("/user/:id", async (req, res, ctx) => {
    const userId = req.params.id;
    const updatedUser = await req.json();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res(
        ctx.status(400),
        ctx.json({ error: `User with id ${userId} not found.` })
      );
    }
    const newUser = { ...users[userIndex], ...updatedUser };
    users.splice(userIndex,1); // remove the old user

    users = [newUser, ...users];

    return res(
      ctx.status(200),
      ctx.body(JSON.stringify(users)),
      ctx.delay(1000)
    );
  }),
  // search users
  rest.get("/users/search", (req, res, ctx) => {
    const queryParams = new URLSearchParams(req.url.search);
    const q = queryParams.get("q")!;

    const filteredUsers = users.filter(
      user =>
        user.title.includes(q) ||
        user.description.includes(q)
    );
  
    return res(
      ctx.status(200),
      ctx.body(JSON.stringify(filteredUsers)),
      ctx.delay(1000)
    );
  }),
];


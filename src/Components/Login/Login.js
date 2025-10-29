import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "Services/AxiosInstane";

import { Slide, toast } from "react-toastify";

let Login = ({ handleLogin }) => {
  //State for login fields
  let [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  //onChange event listner for input fields
  let handleOnChange = (e) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
    
  };
  //onClick event listner for login button
  let handleOnClick = () => {
    axiosInstance
      .post(process.env.REACT_APP_LOGIN_URL, {
        username: loginDetails.username,
        password: loginDetails.password,
       
      })
      .then((res) => {
       
        if (res.status === 200) {
          localStorage.clear();
          localStorage.setItem("token", JSON.stringify(res.data.token));
          //login successfuk notification
          toast.success("Login Sccessful", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
          });
          if (
            loginDetails.username == "admin" &&
            loginDetails.password == "admin"
          ) {
            navigate("/changepassword");
          } else {
            navigate("/");
          }
        }
      })
      .catch((err) => {
        //notification when login failed
        toast.error("Check Details", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      });
  };
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 ">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm gap-2.5 flex flex-col">
        <div>
          <label
            htmlFor="username"
            className="flex block text-sm font-medium leading-6 text-gray-900"
          >
            Username
          </label>
          <div className="mt-2">
            <input
              id="username"
              name="username"
              type="username"
              value={loginDetails.username}
              onChange={handleOnChange}
              required
              className="block w-full rounded-md border-3 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 "
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Password
            </label>
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={loginDetails.password}
              onChange={handleOnChange}
              required
              className="block w-full rounded-md border-3 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-1"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleOnClick}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;

import React, { useState, useContext } from "react";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Slide, toast } from "react-toastify";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { getDomainDetails, deleteDomain as deleteDomainService, syncUsers } from "../../Services/DomainService";
import {  useNavigate } from "react-router-dom";
import { PoolContext } from "../../Context/PoolContext";
import { Loader2 } from "lucide-react";
import { useRef } from "react";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const DomainCard = (props) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  //pool context
  const pc = useContext(PoolContext);
  const token=pc.token
  let [domainDetails, setDomainDetails] = useState();
  let get_domainDetails = async (domain_id) => {
    try {
      const data = await getDomainDetails(token, domain_id);
      setDomainDetails(data);
      navigate(`/domain/edit-domain/${domain_id}`);
    } catch (err) {
      toast.error("Failed to fetch domain details", {
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
    }
  };
  let deleteDomain = async (domain_id) => {
    setIsLoading(true);
    try {
      const res = await deleteDomainService(token, domain_id);
      let status_code = res.data.code;
      let ldaps = res.data.data;
      if (status_code == 200) {
        toast.success(res.data.msg, {
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
        pc.setAvailableDomains(ldaps);
        navigate("/domain");
      } else {
        toast.error(res.data.msg || "Deletion Failed", {
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
      }
    } catch (err) {
      toast.error("Deletion failed", {
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
    } finally {
      setIsLoading(false);
      setMenuOpen(false);
    }
  };
  let handleOnClick = async (exp, id) => {
    switch (exp) {
      case "sync":
        try {
          const res = await syncUsers(token, id);
          if (res.data.code == 200) {
            toast.success(res.data.msg, {
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
          } else {
            toast.error(res.data.msg, {
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
          }
        } catch (err) {
          toast.error("Sync failed", {
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
        }
        break;
      case "edit":
        get_domainDetails(id);
        break;
      case "delete":
        deleteDomain(id);
        break;
      default:
    }
  };
  return (
    <div className="rounded-md hover:shadow-md border-2 border-gray-900/10 text-left w-[250px] relative border-1 border-gray-50 bg-white">
      <Menu as="div" className="absolute top-3 right-3" >
        <Menu.Button
          ref={menuButtonRef}
          className="flex rounded-full text-sm hover:ring-2"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="" />
          <EllipsisVerticalIcon className="w-5 h-5" />
        </Menu.Button>
        <Transition
          as={Fragment}
          show={menuOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={() => {
                    setMenuOpen(false);
                    handleOnClick("sync", props.id);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Sync all users
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!isLoading) {
                      setMenuOpen(true); // Keep menu open
                      handleOnClick("delete", props.id);
                    }
                  }}
                  className={classNames(
                    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2",
                    isLoading ? "opacity-60 pointer-events-none" : ""
                  )}
                  aria-disabled={isLoading}
                  style={{ cursor: isLoading ? "wait" : "pointer" }}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isLoading ? "Deleting..." : "Delete"}</span>
                </div>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>

      <div className="px-6 py-4 border-1 ">
        <div
          className="font-bold text-xl mb-2 cursor-pointer hover:text-[#1a365d] hover:underline"
          onClick={() => handleOnClick("edit", props.id)}
        >
          {props.name}
        </div>
        <p className="text-gray-700 text-base">{props.name}</p>
      </div>
      <div className="px-6 pt-4 pb-2 border-1 shadow-md">
        <span className="inline-block bg-[#1a365d]/80 rounded-md px-2 py-1 text-sm font-semibold text-[#f5f5f5] hover:text-white mr-2">
          {props.providerId}
        </span>
        <span className="inline-block bg-[#1a365d]/80 rounded-md px-2 py-1 text-sm font-semibold text-[#f5f5f5] hover:text-white mr-2">
          {props.enabled}
        </span>
      </div>
    </div>
  );
};

export default DomainCard;

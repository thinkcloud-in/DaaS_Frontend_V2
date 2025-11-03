import React from "react";
import Popup from "../Popup/Popup";
import { PhotoIcon } from "@heroicons/react/24/solid";

const TemplateSettings = (props) => {
  return (
    <div className="space-y-5 m-2 flex-1 template_class">
      <Popup
        open={props.open}
        setOpen={props.setOpen}
        sendData={props.sendData}
        heading="Please confirm"
        text="Are you sure you want to submit?"
        color="yellow"
      />
      <div className="border-2 border-gray-700/10 mx-10 p-3 shadow-md text-indigo-600">
        <h2 className="font-bold leading-7">PDF Template</h2>
        <div className="text-left table-auto">
          <div className="tr">
            <div className="th">
              <label htmlFor="report" className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Report
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <select
                  name="report"
                  onChange={props.handleOnChange}
                  className="w-full cursor-pointer rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="" disabled defaultValue>
                    Select Report
                  </option>
                  {props.reports.map((report) => (
                    <option key={report} value={report}>
                      {report}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label htmlFor="companyName" className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Company name
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset bg-white ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="companyName"
                    onChange={props.handleOnChange}
                    list="company-names"
                    className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2 rounded-md"
                  />
                  <datalist id="company-names">
                    {props.companyList.map((company) => (
                      <option key={company.id} value={company.company_name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="col-span-full flex-col justify-start align-top th">
              <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Company logo
              </label>
            </div>
            <div className="td px-2">
              {props.imageBase64 ? (
                <>
                  <div
                    style={{ backgroundImage: `url(${props.imageBase64})` }}
                    className="img rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-2 border-2"
                  ></div>
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-2 border-2"
                    onClick={() => props.setImageBase64("")}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="mt-2 flex justify-center rounded-lg border-dashed border-gray-900/25 px-6 py-10 border-2 bg-white">
                  <div className="text-center flex flex-col justify-center items-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div className="flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={props.handleOnChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="ml-10 pl-5 buttons">
        <button
          type="submit"
          onClick={props.handleOnClick}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TemplateSettings;

import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import Pagination from "react-js-pagination";
import {
  setBPMFormLimit,
  setBPMFormListPage,
                   
  setBpmFormSort,
} from "../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import {
  resetFormProcessData
} from "../../../apiManager/services/processServices";
import { HelperServices } from "@formsflow/service";
import { CustomButton, DownArrowIcon } from "@formsflow/components";
import userRoles from "../../../constants/permissions";
function FormTable() {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const formsort = useSelector((state) => state.bpmForms.sort);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const isApplicationCountLoading = useSelector((state) => state.process.isApplicationCountLoading);
  const { createDesigns } = userRoles();
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [currentFormSort ,setCurrentFormSort] = useState(formsort);  

  const pageOptions = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
    {
      text: "All",
      value: totalForms,
    },
  ];


  const handleSort = (key) => {
    setCurrentFormSort((prevSort) => {
      let newSortOrder = "asc";
      
      if (prevSort.sortBy === key) {
        newSortOrder = prevSort.sortOrder === "asc" ? "desc" : "asc";
      }
      return {
        sortBy: key,
        sortOrder: newSortOrder,
      };
    });
  };
  useEffect(() => {
    dispatch(setBpmFormSort(currentFormSort));
  },[currentFormSort,dispatch]);
  
  const viewOrEditForm = (formId, path) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
  };

  const handlePageChange = (page) => {
    dispatch(setBPMFormListPage(page));
  };

  const onSizePerPageChange = (limit) => {
    dispatch(setBPMFormLimit(limit));
    dispatch(setBPMFormListPage(1));
  };

  const stripHtml = (html) => {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const toggleRow = (index) => {
    setExpandedRowIndex(prevIndex => prevIndex === index ? null : index);
  };

  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="10">
            <div className="d-flex align-items-center justify-content-center clientForm-table-col flex-column w-100">
              <h3>{t("No forms found")}</h3>
              <p>{t("Please change the selected filters to view Forms")}</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };
  const SortableHeader = ({ columnKey, title, currentFormSort, handleSort,className }) => {
    const isSorted = currentFormSort.sortBy === columnKey;
    const sortedOrder = isSorted ? currentFormSort.sortOrder : "asc";
    const handleKeyDown = (event)=>{
      if (event.key === 'Enter') {  
        handleSort(columnKey);
        }
    };
    return (
      <div
        className= {`d-flex align-items-center justify-content-between cursor-pointer ${className}`}
        onClick={() => handleSort(columnKey)}
        onKeyDown={handleKeyDown} 
        role="button"
      >
        <span className="mt-1">{t(title)}</span>
        <span>
          {sortedOrder === "asc" ? (
            <i
            data-testid={`${columnKey}-asc-sort-icon`}
            className="fa fa-arrow-up sort-icon fs-16 ms-2"
            data-toggle="tooltip"
            title={t("Ascending")}
          ></i>
          ) : (
            <i
            data-testid={`${columnKey}-desc-sort-icon`}
            className="fa fa-arrow-down sort-icon fs-16 ms-2"
            data-toggle="tooltip"
            title={t("Descending")}
          ></i>
          )}
        </span>
      </div>
    );
  };
  SortableHeader.propTypes = {
    columnKey: PropTypes.string.isRequired,  
    title: PropTypes.string.isRequired,      
    currentFormSort: PropTypes.shape({
      sortBy: PropTypes.string,
      sortOrder: PropTypes.string
    }).isRequired,                          
    handleSort: PropTypes.func.isRequired,     
    className: PropTypes.string              
  };
  return (
    <>
      <LoadingOverlay active={searchFormLoading || isApplicationCountLoading} spinner text={t("Loading...")}>
        <div className="min-height-400">
          <div className="custom-tables-wrapper">
            <table className="table custom-tables table-responsive-sm">
              <thead className="table-header">
                <tr>
                  <th className="w-20">
                  <SortableHeader
                   columnKey="formName"
                   title="Form Name"
                   currentFormSort={currentFormSort}
                   handleSort={handleSort}
                   className="ms-4"
                  />
                  </th>
                  <th className="w-30" scope="col">{t("Description")}</th>
                  <th className="w-13" scope="col">
                  <SortableHeader 
                  columnKey="modified"
                  title="Last Edited"
                  currentFormSort={currentFormSort}
                  handleSort={handleSort}
                  />
                  </th>
                  <th className="w-13" scope="col">
                  <SortableHeader 
                    columnKey="visibility"
                    title="Visibility"
                    currentFormSort={currentFormSort}
                    handleSort={handleSort} />
                  </th>
                  <th className="w-12" scope="col" colSpan="4">
                    <SortableHeader 
                    columnKey="status"
                    title="Status"
                    currentFormSort={currentFormSort}
                    handleSort={handleSort} />
                  </th>
                  <th className="w-12" colSpan="4" aria-label="Search Forms by form title"></th>
                </tr>
              </thead>

              {formData?.length ? (
                <tbody>
                  {formData?.map((e, index) => {
                    const isExpanded = expandedRowIndex === index;

                    return (
                      <tr key={index}>
                        <td className="w-20">
                          <div className="d-flex">
                            <span className="ms-4 text-container">{e.title}</span>
                          </div>
                        </td>
                        <td className="w-30 cursor-pointer">
                          <span className={isExpanded ? "text-container-expand" : "text-container"}
                            onClick={() => toggleRow(index)}>
                            {stripHtml(e.description ? e.description : "")}
                          </span>
                        </td>
                        <td className="w-13">{HelperServices?.getLocaldate(e.modified)}</td>
                        <td className="w-13">{e.anonymous ? t("Public") : t("Private")}</td>
                        <td className="w-12">
                          <span data-testid={`form-status-${e._id}`} className="d-flex align-items-center">
                            {e.status === "active" ? (
                              <>
                                <span className="status-live"></span>
                              </>
                            ) : (
                              <span className="status-draft"></span>
                            )}
                            {e.status === "active" ? t("Live") : t("Draft")}
                          </span>
                        </td>
                        <td className="w-12">
                          {createDesigns && <CustomButton
                            variant="secondary"
                            size="sm"
                            label={<Translation>{(t) => t("Edit")}</Translation>}
                            onClick={() => viewOrEditForm(e._id, 'edit')}
                            className=""
                            dataTestid={`form-edit-button-${e._id}`}
                            ariaLabel="Edit Form Button"
                          />}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    {formData.length ? (
                      <>
                        <td colSpan={3}>
                          <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
                            <span className="ms-2 pagination-text">
                              {t("Showing")} {(limit * pageNo) - (limit - 1)} {t("to")}{" "}
                              {limit * pageNo > totalForms ? totalForms : limit * pageNo}{" "}
                              {t("of")} {totalForms} {t("results")}
                            </span>
                          </div>
                        </td>
                        <td colSpan={3}>
                          <div className="d-flex align-items-center justify-content-around">
                            <Pagination
                              activePage={pageNo}
                              itemsCountPerPage={limit}
                              totalItemsCount={totalForms}
                              pageRangeDisplayed={5}
                              itemClass="page-item"
                              linkClass="page-link"
                              onChange={handlePageChange}
                            />
                          </div>
                        </td>
                        <td colSpan={3}>
                          <div className="d-flex align-items-center justify-content-end">
                            <span className="pagination-text">{t("Rows per page")}</span>
                            <div className="pagination-dropdown">
                              <Dropdown data-testid="page-limit-dropdown">
                                <Dropdown.Toggle variant="light" id="dropdown-basic" data-testid="page-limit-dropdown-toggle">
                                  {limit}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {pageOptions.map((option, index) => (
                                    <Dropdown.Item
                                      key={index}
                                      type="button"
                                      data-testid={`page-limit-dropdown-item-${option.value}`}
                                      onClick={() => {
                                        onSizePerPageChange(option.value);
                                      }}
                                    >
                                      {option.text}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                              < DownArrowIcon />
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td colSpan={3}></td>
                    )}
                  </tr>
                </tbody>
              ) : !searchFormLoading ? (
                noDataFound()
              ) : null}
            </table>
          </div>
        </div>
      </LoadingOverlay>
    </>
  );
}

export default FormTable;

interface BreadcrumbProps {
    pageTitle: string;
}

const AdminPageBreadCrumb : React.FC<BreadcrumbProps> = ({ pageTitle }) => {
    return (
        <div className="flex flex-wrap items- justify-between gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                {pageTitle}
            </h2>
        </div> 
    );
};

export default AdminPageBreadCrumb;

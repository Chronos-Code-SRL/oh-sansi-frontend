interface BreadcrumbProps {
    pageTitle: string;
}

const TitleBreadCrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
                {pageTitle}
            </h2>
        </div>
    );
};

export default TitleBreadCrumb;

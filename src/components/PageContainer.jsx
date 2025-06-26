import './PageContainer.css';

function PageContainer({children}) {
  return (
    <div className="pagecontainer-box">
        {children}
    </div>
  );
}

export default PageContainer;

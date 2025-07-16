import axios from 'apis/axios.global';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CalendarRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams: any = new URLSearchParams(window.location.search);
    const authCode = queryParams.get('code')
    const mrmId = localStorage.getItem("mrmId")
    const auditSchId = localStorage.getItem("auditSchId")
    if(mrmId){
      axios.get(`${process.env.REACT_APP_API_URL}/api/mrm/MsCalToken?code=${authCode}&mrmId=${mrmId ? mrmId : ""}`)
      localStorage.removeItem('mrmId');
      navigate("/mrm/mrm");
    }
    if(auditSchId){
      axios.get(`${process.env.REACT_APP_API_URL}/api/auditSchedule/MsCalToken?code=${authCode}&auditSchId=${auditSchId ? auditSchId : ""}`)
      localStorage.removeItem('auditId');
      navigate("/audit");
    }
  }, []);

  return <div>Query parameter</div>;
}

export default CalendarRedirectPage
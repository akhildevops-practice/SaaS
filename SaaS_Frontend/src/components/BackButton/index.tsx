import { Button } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft } from 'react-icons/md';
import useStyles from "./styles";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";

type Props = {
  parentPageLink: string;
  redirectToTab?: string;
};

function BackButton({ parentPageLink, redirectToTab = "" }: Props) {
  const mobile = useRecoilValue(mobileView);
  const navigate = useNavigate();
  const classes = useStyles();
  return (
    <Button
      onClick={() => {
        navigate(parentPageLink, {
          state: { redirectToTab: redirectToTab }, // Your state here
        });
      }}
      className={mobile ? classes.backBtnMobile : classes.backBtn}
    >
      <MdChevronLeft fontSize="small" />
      Back
    </Button>
  );
}

export default BackButton;

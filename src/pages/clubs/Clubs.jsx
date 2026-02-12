import { CiFilter } from "react-icons/ci";
import { PiCaretLeftBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ClubCard,
  Footer,
  Loading,
  Navbar,
} from "../../components/shared";
import ComponentHelmet from "../../utils/ComponentHelmet";
import "./Clubs.scss";

const Clubs = () => {
  // demo 20 array of clubs
  const clubs = Array.from({ length: 20 }, () => ({
    _id: "673ac2814c6e89e58af8ca11",
    userType: "club",
    userName: "tamalcodes",
    name: "God Father Org",
    email: "tamalcodes@gmail.com",
    password: "$2a$10$90vC9McfHXpXpLlzUOFeuulorPR9dIQ2ns37uIP5sX5ehyO5C.Mmm",
    cart: [],
    __v: 0,
  }));

  const navigate = useNavigate();

  return (
    <>
      <ComponentHelmet type="Clubs" />
      <Navbar />

      <div className="clubs_header">
        <div className="clubs_search_parent">
          <input
            type="text"
            name=""
            id=""
            placeholder="Type to begin search, or use the filters"
            onChange={(e) => {
              // Pendo Track Event: club_search_performed (debounced via onChange)
              if (e.target.value && typeof pendo !== "undefined") {
                pendo.track("club_search_performed", {
                  search_query: (e.target.value || "").substring(0, 100),
                  results_count: String(clubs?.length || 0),
                });
              }
            }}
          />
          <button>
            Filters <CiFilter />
          </button>
        </div>

        <Button
          className="viewdashboard"
          onClickfunction={() => {
            navigate("/dashboard");
          }}
        >
          Your Dashboard <PiCaretLeftBold />
        </Button>
      </div>

      <div className="clubs_parent">
        {!clubs || clubs?.length === 0 ? (
          <Loading />
        ) : (
          clubs?.map((club, id) => <ClubCard club={club} key={id} />)
        )}
      </div>

      <Footer />
    </>
  );
};

export default Clubs;

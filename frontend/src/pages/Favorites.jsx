import ExplorerTable from "../components/ExplorerTable";
import { getFavoritesList } from "../api/library";


export default function Favorites() {

  return (
    <>
    <ExplorerTable route="/favorites" listFunc={getFavoritesList}/>
    </>
  )
}


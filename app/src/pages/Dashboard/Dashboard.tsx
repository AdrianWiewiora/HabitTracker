import Card from '../../components/Card/Card';
import './Dashboard.scss';
import LogoCard from "../../components/LogoCard/LogoCard.tsx";

export default function Dashboard() {
    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                <div className="left-column">
                    <Card>Lewa kolumna – pełna wysokość</Card>
                </div>
                <div className="right-column">
                    <LogoCard />
                    <Card className="bottom-card">Prawa kolumna – dolna karta</Card>
                </div>
            </div>
        </div>
    );
}

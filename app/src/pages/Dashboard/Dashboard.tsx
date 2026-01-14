import Card from '../../components/Card/Card';
import LogoCard from "../../components/LogoCard/LogoCard";
import MyHabits from '../../components/MyHabits/MyHabits';
import './Dashboard.scss';

export default function Dashboard() {
    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">

                {/* LEWA KOLUMNA */}
                <div className="left-column">
                    <Card>
                        <MyHabits />
                    </Card>
                </div>

                {/* PRAWA KOLUMNA */}
                <div className="right-column">
                    <LogoCard />
                    <Card className="bottom-card">
                        <h2>Right Column (Details)</h2>
                    </Card>
                </div>
            </div>
        </div>
    );
}
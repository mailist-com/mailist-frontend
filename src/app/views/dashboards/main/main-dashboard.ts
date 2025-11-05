import { Component } from '@angular/core';
import { PageTitle } from "../../../components/page-title/page-title";
import { OverviewStats } from "./components/overview-stats/overview-stats";
import { GrowthChart } from "./components/growth-chart/growth-chart";
import { RecentCampaigns } from "./components/recent-campaigns/recent-campaigns";
import { QuickActions } from "./components/quick-actions/quick-actions";
import { ActivityFeed } from "./components/activity-feed/activity-feed";

@Component({
  selector: 'app-main-dashboard',
  imports: [PageTitle, OverviewStats, GrowthChart, RecentCampaigns, QuickActions, ActivityFeed],
  templateUrl: './main-dashboard.html',
  styles: ``
})
export class MainDashboard {

}

// Voting System Application JavaScript

class VotingSystem {
    constructor() {
        this.categories = {
            A: { name: "1995", weightage: 1.870, max_votes: 94 },
            B: { name: "1695", weightage: 1.574, max_votes: 300 },
            C: { name: "1495", weightage: 1.398, max_votes: 391 },
            D: { name: "13XX", weightage: 1.261, max_votes: 647 },
            E: { name: "1030", weightage: 1.000, max_votes: 6 }
        };

        this.candidates = [
            "Abhishek Tiwari", "Ajay Jaitly", "Amit Singh", "Arijit Ghosh", 
            "Mahendra Singh Yadav", "Milan Saxena", "Mukesh Kumar Gupta", "Nisha Singh", 
            "Rajendra Kumar Gupta", "Rakesh Kumar Singh","Sanjay Taneja", "Saurabh C Verma", 
            "Sumit Manocha", "S.C. Bisht", "Vibhor Gupta", "Yogendra Bajaj"
        ];

        // Initialize with balanced sample data
        this.originalVotes = [
            [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
            [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
            [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
            [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
        ];

        this.votes = JSON.parse(JSON.stringify(this.originalVotes));
        this.charts = {};
        this.currentTab = 'workingSheet';
        
        this.init();
    }

    init() {
        console.log('Initializing Voting System...');
        this.setupEventListeners();
        this.renderVotingGrid();
        this.updateCategoryLimits();
        this.updateTopCandidates();
        
        // Initialize dashboard after a short delay
        setTimeout(() => {
            this.updateDashboard();
            console.log('Dashboard initialized');
        }, 200);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Tab switching
        const workingSheetTab = document.getElementById('workingSheetTab');
        const dashboardTab = document.getElementById('dashboardTab');
        
        if (workingSheetTab) {
            workingSheetTab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Working Sheet tab clicked');
                this.switchTab('workingSheet');
            });
        }
        
        if (dashboardTab) {
            dashboardTab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Dashboard tab clicked');
                this.switchTab('dashboard');
            });
        }

        // Export and reset buttons
        const exportBtn = document.getElementById('exportBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Export button clicked');
                this.exportToExcel();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reset button clicked');
                this.resetData();
            });
        }
    }

    switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        
        try {
            // Remove active classes from all tabs and content
            const allTabBtns = document.querySelectorAll('.tab-btn');
            const allTabContent = document.querySelectorAll('.tab-content');
            
            allTabBtns.forEach(btn => {
                btn.classList.remove('tab-btn--active');
            });
            
            allTabContent.forEach(content => {
                content.classList.remove('tab-content--active');
                content.style.display = 'none';
            });

            // Activate selected tab
            const targetTabBtn = document.getElementById(tabName + 'Tab'); 
            const targetContent = document.getElementById(tabName);
            
            if (targetTabBtn && targetContent) {
                targetTabBtn.classList.add('tab-btn--active');
                targetContent.classList.add('tab-content--active');
                targetContent.style.display = 'block';
                
                this.currentTab = tabName;
                console.log(`Successfully switched to ${tabName}`);

                // Update dashboard when switching to it
                if (tabName === 'dashboard') {
                    setTimeout(() => {
                        this.updateDashboard();
                        console.log('Dashboard updated after tab switch');
                    }, 100);
                }
            } else {
                console.error(`Could not find elements for tab: ${tabName}`);
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    renderVotingGrid() {
        console.log('Rendering voting grid...');
        const votingRows = document.getElementById('votingRows');
        if (!votingRows) {
            console.error('Could not find votingRows element');
            return;
        }
        
        votingRows.innerHTML = '';

        this.candidates.forEach((candidate, index) => {
            const row = document.createElement('div');
            row.className = 'voting-row';
            row.innerHTML = `
                <div class="candidate-cell">${candidate}</div>
                <div class="vote-cell">
                    <input type="number" class="vote-input" 
                           data-candidate="${index}" data-category="0" 
                           value="${this.votes[index][0]}" min="0">
                </div>
                <div class="vote-cell">
                    <input type="number" class="vote-input" 
                           data-candidate="${index}" data-category="1" 
                           value="${this.votes[index][1]}" min="0">
                </div>
                <div class="vote-cell">
                    <input type="number" class="vote-input" 
                           data-candidate="${index}" data-category="2" 
                           value="${this.votes[index][2]}" min="0">
                </div>
                <div class="vote-cell">
                    <input type="number" class="vote-input" 
                           data-candidate="${index}" data-category="3" 
                           value="${this.votes[index][3]}" min="0">
                </div>
                <div class="vote-cell">
                    <input type="number" class="vote-input" 
                           data-candidate="${index}" data-category="4" 
                           value="${this.votes[index][4]}" min="0">
                </div>
                <div class="total-cell">
                    <span class="total-votes" id="total-${index}">${this.getTotalVotes(index)}</span>
                </div>
                <div class="score-cell">
                    <span class="weighted-score" id="score-${index}">${this.getWeightedScore(index).toFixed(3)}</span>
                </div>
            `;
            votingRows.appendChild(row);
        });

        // Add event listeners to vote inputs with better error handling
        const voteInputs = document.querySelectorAll('.vote-input');
        console.log(`Found ${voteInputs.length} vote inputs`);
        
        voteInputs.forEach((input, i) => {
            input.addEventListener('input', (e) => {
                console.log(`Vote input ${i} changed to: ${e.target.value}`);
                this.handleVoteInput(e);
            });
            input.addEventListener('blur', (e) => this.validateInput(e));
        });

        console.log('Voting grid rendered successfully');
    }

    handleVoteInput(event) {
        const input = event.target;
        const candidateIndex = parseInt(input.dataset.candidate);
        const categoryIndex = parseInt(input.dataset.category);
        const value = parseInt(input.value) || 0;

        console.log(`Updating vote: Candidate ${candidateIndex}, Category ${categoryIndex}, Value: ${value}`);

        // Update votes array
        this.votes[candidateIndex][categoryIndex] = value;

        // Validate category limits
        this.validateCategoryLimits();

        // Update totals and scores
        this.updateCandidateRow(candidateIndex);
        this.updateCategoryLimits();
        this.updateTopCandidates();

        // Update dashboard if it's active
        if (this.currentTab === 'dashboard') {
            this.updateDashboard();
        }
    }

    validateInput(event) {
        const input = event.target;
        const value = parseInt(input.value) || 0;
        
        if (value < 0) {
            input.value = 0;
            this.handleVoteInput(event);
        }
    }

    validateCategoryLimits() {
        const categoryKeys = ['A', 'B', 'C', 'D', 'E'];
        
        categoryKeys.forEach((key, index) => {
            const total = this.getCategoryTotal(index);
            const maxVotes = this.categories[key].max_votes;
            
            // Update input styling based on category limit
            document.querySelectorAll(`[data-category="${index}"]`).forEach(input => {
                input.classList.remove('error');
                if (total > maxVotes) {
                    input.classList.add('error');
                }
            });
        });
    }

    getCategoryTotal(categoryIndex) {
        return this.votes.reduce((sum, candidateVotes) => sum + candidateVotes[categoryIndex], 0);
    }

    getTotalVotes(candidateIndex) {
        return this.votes[candidateIndex].reduce((sum, votes) => sum + votes, 0);
    }

    getWeightedScore(candidateIndex) {
        const weights = [1.870, 1.574, 1.398, 1.261, 1.000];
        return this.votes[candidateIndex].reduce((score, votes, index) => score + (votes * weights[index]), 0);
    }

    updateCandidateRow(candidateIndex) {
        const totalElement = document.getElementById(`total-${candidateIndex}`);
        const scoreElement = document.getElementById(`score-${candidateIndex}`);
        
        if (totalElement) totalElement.textContent = this.getTotalVotes(candidateIndex);
        if (scoreElement) scoreElement.textContent = this.getWeightedScore(candidateIndex).toFixed(3);
    }

    updateCategoryLimits() {
        const categoryKeys = ['A', 'B', 'C', 'D', 'E'];
        
        categoryKeys.forEach((key, index) => {
            const total = this.getCategoryTotal(index);
            const maxVotes = this.categories[key].max_votes;
            const percentage = (total / maxVotes) * 100;
            
            const usedElement = document.getElementById(`used${key}`);
            const progressBar = document.getElementById(`progress${key}`);
            
            if (usedElement) usedElement.textContent = total;
            if (progressBar) {
                progressBar.style.width = `${Math.min(percentage, 100)}%`;
                
                // Update progress bar color based on usage
                progressBar.classList.remove('warning', 'error');
                if (percentage > 100) {
                    progressBar.classList.add('error');
                } else if (percentage > 80) {
                    progressBar.classList.add('warning');
                }
            }
        });
    }

    updateTopCandidates() {
        const candidatesWithScores = this.candidates.map((name, index) => ({
            name,
            index,
            score: this.getWeightedScore(index)
        }));

        candidatesWithScores.sort((a, b) => b.score - a.score);
        const top9Indices = candidatesWithScores.slice(0, 9).map(c => c.index);

        // Update row styling
        document.querySelectorAll('.voting-row').forEach((row, index) => {
            row.classList.remove('top-candidate');
            if (top9Indices.includes(index)) {
                row.classList.add('top-candidate');
            }
        });
    }

    updateDashboard() {
        console.log('Updating dashboard...');
        try {
            this.updateSummaryStats();
            this.updateRankingsTable();
            // Wait for DOM to be ready before updating charts
            setTimeout(() => {
                this.updateCharts();
            }, 50);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    updateSummaryStats() {
        const totalVotes = this.votes.reduce((sum, candidateVotes) => 
            sum + candidateVotes.reduce((candidateSum, votes) => candidateSum + votes, 0), 0
        );
        
        const categoriesUsed = ['A', 'B', 'C', 'D', 'E'].filter((key, index) => 
            this.getCategoryTotal(index) > 0
        ).length;

        const scores = this.candidates.map((_, index) => this.getWeightedScore(index));
        const topScore = Math.max(...scores);

        const totalVotesElement = document.getElementById('totalVotesCast');
        const categoriesUsedElement = document.getElementById('categoriesUsed');
        const topScoreElement = document.getElementById('topScore');

        if (totalVotesElement) totalVotesElement.textContent = totalVotes;
        if (categoriesUsedElement) categoriesUsedElement.textContent = categoriesUsed;
        if (topScoreElement) topScoreElement.textContent = topScore.toFixed(1);
    }

    updateRankingsTable() {
        const candidatesWithScores = this.candidates.map((name, index) => ({
            name,
            index,
            score: this.getWeightedScore(index),
            totalVotes: this.getTotalVotes(index)
        }));

        candidatesWithScores.sort((a, b) => b.score - a.score);

        const rankingsTable = document.getElementById('rankingsTable');
        if (!rankingsTable) {
            console.error('Rankings table element not found');
            return;
        }
        
        rankingsTable.innerHTML = '';

        candidatesWithScores.forEach((candidate, rank) => {
            const row = document.createElement('div');
            row.className = `ranking-row ${rank < 9 ? 'top-9' : ''}`;
            row.innerHTML = `
                <div class="rank-number">${rank + 1}</div>
                <div class="rank-candidate">${candidate.name}</div>
                <div class="rank-score">${candidate.score.toFixed(3)}</div>
            `;
            rankingsTable.appendChild(row);
        });
        
        console.log('Rankings table updated');
    }

    updateCharts() {
        console.log('Updating charts...');
        try {
            this.updateScoresChart();
            this.updateDistributionChart();
            this.updateUtilizationChart();
            console.log('All charts updated successfully');
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    updateScoresChart() {
        const canvas = document.getElementById('scoresChart');
        if (!canvas) {
            console.error('Scores chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        const candidatesWithScores = this.candidates.map((name, index) => ({
            name,
            score: this.getWeightedScore(index)
        }));
        candidatesWithScores.sort((a, b) => b.score - a.score);

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

        if (this.charts.scores) {
            this.charts.scores.destroy();
        }

        this.charts.scores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: candidatesWithScores.map(c => c.name),
                datasets: [{
                    label: 'Weighted Score',
                    data: candidatesWithScores.map(c => c.score),
                    backgroundColor: candidatesWithScores.map((_, index) => colors[index % colors.length]),
                    borderColor: candidatesWithScores.map((_, index) => colors[index % colors.length]),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weighted Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Candidates'
                        }
                    }
                }
            }
        });
        console.log('Scores chart updated');
    }

    updateDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) {
            console.error('Distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        const categoryData = ['A', 'B', 'C', 'D', 'E'].map((key, index) => ({
            category: `${key} (${this.categories[key].name})`,
            total: this.getCategoryTotal(index)
        }));

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        this.charts.distribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryData.map(c => c.category),
                datasets: [{
                    data: categoryData.map(c => c.total),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        console.log('Distribution chart updated');
    }

    updateUtilizationChart() {
        const canvas = document.getElementById('utilizationChart');
        if (!canvas) {
            console.error('Utilization chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        const utilizationData = ['A', 'B', 'C', 'D', 'E'].map((key, index) => ({
            category: `${key} (${this.categories[key].name})`,
            used: this.getCategoryTotal(index),
            max: this.categories[key].max_votes,
            percentage: (this.getCategoryTotal(index) / this.categories[key].max_votes) * 100
        }));

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

        if (this.charts.utilization) {
            this.charts.utilization.destroy();
        }

        this.charts.utilization = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: utilizationData.map(c => c.category),
                datasets: [{
                    label: 'Used Votes',
                    data: utilizationData.map(c => c.used),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }, {
                    label: 'Max Votes',
                    data: utilizationData.map(c => c.max),
                    backgroundColor: colors.map(color => color + '40'),
                    borderColor: colors,
                    borderWidth: 1,
                    type: 'bar'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Votes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categories'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        console.log('Utilization chart updated');
    }

    exportToExcel() {
        console.log('Exporting to Excel...');
        try {
            // Show feedback to user
            const exportBtn = document.getElementById('exportBtn');
            const originalText = exportBtn ? exportBtn.textContent : 'Export to Excel';
            
            if (exportBtn) {
                exportBtn.textContent = 'Exporting...';
                exportBtn.disabled = true;
                exportBtn.style.opacity = '0.7';
            }

            // Create CSV content
            let csvContent = "Candidate,A (1995),B (1695),C (1495),D (13XX),E (1030),Total Votes,Weighted Score\n";
            
            this.candidates.forEach((candidate, index) => {
                const votes = this.votes[index];
                const totalVotes = this.getTotalVotes(index);
                const weightedScore = this.getWeightedScore(index);
                
                csvContent += `${candidate},${votes.join(',')},${totalVotes},${weightedScore.toFixed(3)}\n`;
            });

            // Add summary
            csvContent += "\n\nSummary:\n";
            csvContent += "Category,Used Votes,Max Votes,Utilization %\n";
            ['A', 'B', 'C', 'D', 'E'].forEach((key, index) => {
                const used = this.getCategoryTotal(index);
                const max = this.categories[key].max_votes;
                const utilization = ((used / max) * 100).toFixed(1);
                csvContent += `${key} (${this.categories[key].name}),${used},${max},${utilization}%\n`;
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `voting_results_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Restore button and show success
            setTimeout(() => {
                if (exportBtn) {
                    exportBtn.textContent = 'Exported Successfully!';
                    exportBtn.style.background = 'var(--color-success)';
                    exportBtn.style.opacity = '1';
                    setTimeout(() => {
                        exportBtn.textContent = originalText;
                        exportBtn.style.background = '';
                        exportBtn.disabled = false;
                    }, 2000);
                }
            }, 500);

        } catch (error) {
            console.error('Export error:', error);
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.textContent = 'Export Failed';
                exportBtn.style.background = 'var(--color-error)';
                setTimeout(() => {
                    exportBtn.textContent = 'Export to Excel';
                    exportBtn.style.background = '';
                    exportBtn.disabled = false;
                    exportBtn.style.opacity = '1';
                }, 2000);
            }
        }
    }

    resetData() {
        console.log('Reset data requested...');
        if (confirm('Are you sure you want to reset all voting data? This action cannot be undone.')) {
            try {
                console.log('Resetting data...');
                // Show feedback
                const resetBtn = document.getElementById('resetBtn');
                const originalText = resetBtn ? resetBtn.textContent : 'Reset Data';
                
                if (resetBtn) {
                    resetBtn.textContent = 'Resetting...';
                    resetBtn.disabled = true;
                    resetBtn.style.opacity = '0.7';
                }

                // Reset votes to original sample data
                this.votes = JSON.parse(JSON.stringify(this.originalVotes));
                
                // Re-render everything
                this.renderVotingGrid();
                this.updateCategoryLimits();
                this.updateTopCandidates();
                this.updateDashboard();

                // Restore button
                setTimeout(() => {
                    if (resetBtn) {
                        resetBtn.textContent = 'Reset Complete!';
                        resetBtn.style.background = 'var(--color-success)';
                        resetBtn.style.opacity = '1';
                        setTimeout(() => {
                            resetBtn.textContent = originalText;
                            resetBtn.style.background = '';
                            resetBtn.disabled = false;
                        }, 2000);
                    }
                }, 500);

                console.log('Data reset successfully');

            } catch (error) {
                console.error('Reset error:', error);
                const resetBtn = document.getElementById('resetBtn');
                if (resetBtn) {
                    resetBtn.textContent = 'Reset Failed';
                    resetBtn.style.background = 'var(--color-error)';
                    setTimeout(() => {
                        resetBtn.textContent = 'Reset Data';
                        resetBtn.style.background = '';
                        resetBtn.disabled = false;
                        resetBtn.style.opacity = '1';
                    }, 2000);
                }
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    window.votingSystem = new VotingSystem();
});

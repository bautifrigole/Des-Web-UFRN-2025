let groups = JSON.parse(localStorage.getItem("groups")) || [];
const params = new URLSearchParams(window.location.search);
const groupIndex = parseInt(params.get("group"));

if (isNaN(groupIndex) || groupIndex >= groups.length) {
    alert("Invalid group selected!");
    window.location.href = "../home/index.html";
}

const group = groups[groupIndex];
const groupNameInput = document.getElementById("group-name");
const memberList = document.getElementById("member-list");
const newMemberNameInput = document.getElementById("new-member-name");

function renderMembers() {
    memberList.innerHTML = "";

    group.members.forEach((member, index) => {
        const li = document.createElement("li");
        li.classList.add("member-item");

        const input = document.createElement("input");
        input.type = "text";
        input.value = member;
        input.classList.add("member-input");
        input.addEventListener("input", (e) => {
            group.members[index] = e.target.value;
        });

        li.appendChild(input);
        memberList.appendChild(li);
    });
}

document.getElementById("add-member-btn").addEventListener("click", () => {
    const newMember = newMemberNameInput.value.trim();
    if (newMember !== "") {
        group.members.push(newMember);
        newMemberNameInput.value = "";
        renderMembers();
    }
});

document.getElementById("save-btn").addEventListener("click", () => {
    group.name = groupNameInput.value.trim() || group.name;
    groups[groupIndex] = group;
    localStorage.setItem("groups", JSON.stringify(groups));
    alert("Group saved!");
    window.location.href = "../home/index.html";
});

groupNameInput.value = group.name;
renderMembers();

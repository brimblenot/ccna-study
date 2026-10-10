/**
 * Download the course notes into content/raw/Course_Notes:
 *  - source: psaumur/CCNA_Course_Notes on GitHub (notes taken on Jeremy's IT Lab's CCNA course)
 *  - pinned to the commit this app's lessons were written against
 *  - each file is saved under the "Day NN - Title.md" name that `npm run ingest` expects
 *  - existing files are never overwritten
 *
 * The notes are not redistributed in this repo; this script fetches them from their author's repo.
 *
 * Usage: npm run fetch-notes
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "content", "raw", "Course_Notes");

const REPO = "psaumur/CCNA_Course_Notes";
const COMMIT = "4910b5ba6fd6c230c0a80d29829461cb5df26965";
const RETRIES = 2;

// Upstream filename -> local "Day NN - Title.md" name, in course order.
const FILES: [string, string][] = [
  ["Network_Devices.md", "Day 01 - Networking Devices.md"],
  ["Interfaces_and_Cables.md", "Day 02 - Interfaces and Cables.md"],
  ["OSI_Model_TCPSuite.md", "Day 03 - OSI Model and TCP-IP Suite.md"],
  ["Intro_to_CLI.md", "Day 04 - Intro to the CLI.md"],
  ["Ethernet_LAN_Switching_Part1.md", "Day 05 - Ethernet LAN Switching Part 1.md"],
  ["Ethernet_LAN_Switching_Part2.md", "Day 06 - Ethernet LAN Switching Part 2.md"],
  ["IPv4_Addressing_Part1.md", "Day 07 - IPv4 Addressing Part 1.md"],
  ["IPv4_Addressing_Part2.md", "Day 08 - IPv4 Addressing Part 2.md"],
  ["Switch_Interfaces.md", "Day 09 - Switch Interfaces.md"],
  ["The_IPv4_Header.md", "Day 10 - The IPv4 Header.md"],
  ["Routing_Fundamentals_Part1.md", "Day 11a - Routing Fundamentals Part 1.md"],
  ["Static_Routing_Part2.md", "Day 11b - Static Routing Part 2.md"],
  ["Life_of_a_Packet.md", "Day 12 - Life of a Packet.md"],
  ["Subnetting_Part1.md", "Day 13 - Subnetting Part 1.md"],
  ["Subnetting_Part2.md", "Day 14 - Subnetting Part 2.md"],
  ["Subnetting_VLSM_Part3.md", "Day 15 - Subnetting (VLSM) Part 3.md"],
  ["VLAN_Part1.md", "Day 16 - VLANs Part 1.md"],
  ["VLAN_Part2.md", "Day 17 - VLANs Part 2.md"],
  ["VLAN_Part3.md", "Day 18 - VLANs Part 3.md"],
  ["DTP_VTP.md", "Day 19 - DTP and VTP.md"],
  ["Spanning_Tree_Protocol_Part1.md", "Day 20 - Spanning Tree Protocol Part 1.md"],
  ["Spanning_Tree_Protocol_Part2.md", "Day 21 - Spanning Tree Protocol Part 2.md"],
  ["Rapid_Spanning_Tree_Protocol.md", "Day 22 - Rapid Spanning Tree Protocol.md"],
  ["Etherchannel.md", "Day 23 - EtherChannel.md"],
  ["DynamicRouting.md", "Day 24 - Dynamic Routing.md"],
  ["RIP_and_EIGRP.md", "Day 25 - RIP and EIGRP.md"],
  ["OSPF_Part1.md", "Day 26 - OSPF Part 1.md"],
  ["OSPF_Part2.md", "Day 27 - OSPF Part 2.md"],
  ["OSPF_Part3.md", "Day 28 - OSPF Part 3.md"],
  ["First_Hop_Redundancy_Protocols.md", "Day 29 - First Hop Redundancy Protocols.md"],
  ["TCP_and_UDP.md", "Day 30 - TCP and UDP.md"],
  ["IPv6_Part1.md", "Day 31 - IPv6 Part 1.md"],
  ["IPv6_Part2.md", "Day 32 - IPv6 Part 2.md"],
  ["IPv6_Part3.md", "Day 33 - IPv6 Part 3.md"],
  ["Standard_Access_Control_Lists.md", "Day 34 - Standard Access Control Lists.md"],
  ["Extended_Access_Control_Lists.md", "Day 35 - Extended Access Control Lists.md"],
  ["CDP_and_LLDP.md", "Day 36 - CDP and LLDP.md"],
  ["NTP.md", "Day 37 - NTP.md"],
  ["DNS.md", "Day 38 - DNS.md"],
  ["DHCP.md", "Day 39 - DHCP.md"],
  ["SNMP.md", "Day 40 - SNMP.md"],
  ["SYSLOG.md", "Day 41 - Syslog.md"],
  ["SSH.md", "Day 42 - SSH.md"],
  ["FTP_and_TFTP.md", "Day 43 - FTP and TFTP.md"],
  ["NAT_Static_Part1.md", "Day 44 - NAT (Static) Part 1.md"],
  ["NAT_Dynamic_Part2.md", "Day 45 - NAT (Dynamic) Part 2.md"],
  ["QoS_VoiceLan.md", "Day 46 - QoS (Voice VLAN) Part 1.md"],
  ["QoS_Quality_of_Service.md", "Day 47 - QoS Part 2.md"],
  ["Security_Fundamentals.md", "Day 48 - Security Fundamentals.md"],
  ["Port_Security.md", "Day 49 - Port Security.md"],
  ["DHCP_Snooping.md", "Day 50 - DHCP Snooping.md"],
  ["Dynamic_Arp_Inspection.md", "Day 51 - Dynamic ARP Inspection.md"],
  ["LAN_Architectures.md", "Day 52 - LAN Architectures.md"],
  ["WAN_Architectures.md", "Day 53 - WAN Architectures.md"],
  ["Virtualizations_and_Cloud_Part1.md", "Day 54a - Virtualization and Cloud Part 1.md"],
  ["Virtualization_Containers.md", "Day 54b - Virtualization (Containers) Part 2.md"],
  ["Virtualization_VRF_Part3.md", "Day 54c - Virtualization (VRF) Part 3.md"],
  ["Wireless_Fundamentals.md", "Day 55 - Wireless Fundamentals.md"],
  ["Wireless_Architecutres.md", "Day 56 - Wireless Architectures.md"],
  ["Wireless_Security.md", "Day 57 - Wireless Security.md"],
  ["Wireless_Configuration.md", "Day 58 - Wireless Configuration.md"],
  ["Introduction_to_Network_Automation.md", "Day 59 - Intro to Network Automation.md"],
  ["JSON_XML_YAML.md", "Day 60 - JSON, XML, and YAML.md"],
  ["REST_APIs.md", "Day 61 - REST APIs.md"],
  ["Software_Defined_Networking.md", "Day 62 - Software Defined Networking.md"],
  ["Ansible_Puppet_Chef.md", "Day 63 - Ansible, Puppet, and Chef.md"],
];

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function download(upstream: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO}/${COMMIT}/Course_Notes/${upstream}`;
  let lastError = "";
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw new Error(`${url} (${lastError})`);
}

async function main() {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  let fetched = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const [upstream, local] of FILES) {
    const target = path.join(NOTES_DIR, local);
    if (await exists(target)) {
      skipped++;
      continue;
    }
    try {
      await fs.writeFile(target, await download(upstream));
      fetched++;
    } catch (err) {
      failures.push(err instanceof Error ? err.message : String(err));
    }
  }

  console.log(`Notes: downloaded ${fetched}, skipped ${skipped} existing, failed ${failures.length}.`);
  console.log(`Folder: ${path.relative(ROOT, NOTES_DIR)}`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
